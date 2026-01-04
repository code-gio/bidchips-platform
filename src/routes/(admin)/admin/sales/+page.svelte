<script lang="ts">
  import { onMount } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import SalesTable from "$lib/components/admin/sales/SalesTable.svelte";
  import MarkAsPaidModal from "$lib/components/admin/sales/MarkAsPaidModal.svelte";
  import MarkAsShippedModal from "$lib/components/admin/sales/MarkAsShippedModal.svelte";
  import SaleDetailsModal from "$lib/components/admin/sales/SaleDetailsModal.svelte";
  import type { SalesRecord } from "$lib/types/sales-record";
  import { IconDownload, IconReceipt } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  let sales = $state<SalesRecord[]>([]);
  let filteredSales = $state<SalesRecord[]>([]);
  let isLoading = $state(true);
  let activeTab = $state("all");
  let showPaidModal = $state(false);
  let showShippedModal = $state(false);
  let showDetailsModal = $state(false);
  let selectedSale = $state<SalesRecord | null>(null);

  onMount(async () => {
    await fetchSales();
    isLoading = false;
  });

  async function fetchSales() {
    try {
      const res = await fetch("/api/admin/sales");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sales = Array.isArray(data.data) ? data.data : (data.data?.data || []);
          applyFilters();
        }
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast.error("Failed to load sales records");
    }
  }

  function applyFilters() {
    let filtered = [...sales];

    // Filter by tab
    if (activeTab === "pending_payment") {
      filtered = filtered.filter((s) => s.payment_status === "pending");
    } else if (activeTab === "paid") {
      filtered = filtered.filter((s) => s.payment_status === "paid");
    } else if (activeTab === "shipped") {
      filtered = filtered.filter((s) => s.shipping_status === "shipped" || s.shipping_status === "delivered");
    }

    filteredSales = filtered;
  }

  $effect(() => {
    applyFilters();
  });

  async function handleMarkPaid(data: {
    payment_method: string;
    payment_reference: string;
    payment_received_at: string;
    admin_notes?: string;
  }) {
    if (!selectedSale) return;
    try {
      const res = await fetch(`/api/admin/sales/${selectedSale.id}/mark-paid`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Sale marked as paid");
          await fetchSales();
          showPaidModal = false;
          selectedSale = null;
        } else {
          throw new Error(result.error || "Failed to mark as paid");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to mark as paid");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as paid");
      throw error;
    }
  }

  async function handleMarkShipped(data: {
    tracking_number: string;
    carrier: string;
    shipped_at: string;
    admin_notes?: string;
  }) {
    if (!selectedSale) return;
    try {
      const res = await fetch(`/api/admin/sales/${selectedSale.id}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Sale marked as shipped");
          await fetchSales();
          showShippedModal = false;
          selectedSale = null;
        } else {
          throw new Error(result.error || "Failed to mark as shipped");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to mark as shipped");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as shipped");
      throw error;
    }
  }

  function handleView(sale: SalesRecord) {
    selectedSale = sale;
    showDetailsModal = true;
  }

  function handleMarkPaidClick(sale: SalesRecord) {
    selectedSale = sale;
    showPaidModal = true;
  }

  function handleMarkShippedClick(sale: SalesRecord) {
    selectedSale = sale;
    showShippedModal = true;
  }

  function exportToCSV() {
    const headers = ["Sale Date", "Lot Title", "Buyer", "Sale Price", "Payment Status", "Shipping Status"];
    const rows = filteredSales.map((sale) => [
      new Date(sale.created_at).toLocaleDateString(),
      sale.lot_title,
      sale.user_name || sale.user_email || "Unknown",
      sale.sale_price.toString(),
      sale.payment_status,
      sale.shipping_status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-records-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sales records exported to CSV");
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Sales Records</h1>
      <p class="text-muted-foreground mt-2">
        Manage sales, payments, and shipping
      </p>
    </div>
    <Button variant="outline" onclick={exportToCSV}>
      <IconDownload class="size-4" />
      Export to CSV
    </Button>
  </div>

  <div class="space-y-4">
    <!-- Tabs -->
    <Tabs.Root bind:value={activeTab} class="w-full">
      <Tabs.List>
        <Tabs.Trigger value="all">All Sales</Tabs.Trigger>
        <Tabs.Trigger value="pending_payment">Pending Payment</Tabs.Trigger>
        <Tabs.Trigger value="paid">Paid</Tabs.Trigger>
        <Tabs.Trigger value="shipped">Shipped</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <!-- Sales Table -->
    {#if isLoading}
      <div class="space-y-2">
        {#each Array(5) as _}
          <div class="h-16 animate-pulse rounded bg-muted"></div>
        {/each}
      </div>
    {:else if filteredSales.length === 0}
      <Empty.Root>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconReceipt />
          </Empty.Media>
          <Empty.Title>No Sales Records</Empty.Title>
          <Empty.Description>
            {#if activeTab === "pending_payment"}
              No sales with pending payment found.
            {:else if activeTab === "paid"}
              No paid sales found.
            {:else if activeTab === "shipped"}
              No shipped sales found.
            {:else}
              No sales records found.
            {/if}
          </Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <SalesTable
        sales={filteredSales}
        onView={handleView}
        onMarkPaid={handleMarkPaidClick}
        onMarkShipped={handleMarkShippedClick}
      />
    {/if}
  </div>
</div>

<!-- Modals -->
<MarkAsPaidModal
  bind:open={showPaidModal}
  sale={selectedSale}
  onConfirm={handleMarkPaid}
  onCancel={() => {
    selectedSale = null;
    showPaidModal = false;
  }}
/>

<MarkAsShippedModal
  bind:open={showShippedModal}
  sale={selectedSale}
  onConfirm={handleMarkShipped}
  onCancel={() => {
    selectedSale = null;
    showShippedModal = false;
  }}
/>

<SaleDetailsModal
  bind:open={showDetailsModal}
  sale={selectedSale}
  onCancel={() => {
    selectedSale = null;
    showDetailsModal = false;
  }}
/>
