<script lang="ts">
  import { onMount } from "svelte";
  import OffersTable from "$lib/components/admin/offers/OffersTable.svelte";
  import AcceptOfferModal from "$lib/components/admin/offers/AcceptOfferModal.svelte";
  import RejectOfferModal from "$lib/components/admin/offers/RejectOfferModal.svelte";
  import CounterOfferModal from "$lib/components/admin/offers/CounterOfferModal.svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { Offer } from "$lib/types/offer";
  import { IconMoneybag, IconSearch } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  let offers = $state<Offer[]>([]);
  let isLoading = $state(true);
  let selectedOffer = $state<Offer | null>(null);
  let showAcceptModal = $state(false);
  let showRejectModal = $state(false);
  let showCounterModal = $state(false);
  let selectedLotId = $state<string>("all");
  let selectedUserId = $state<string>("all");
  let searchQuery = $state("");

  onMount(async () => {
    await fetchOffers();
    isLoading = false;
  });

  async function fetchOffers() {
    try {
      const params = new URLSearchParams();
      params.set("status", "pending");
      if (selectedLotId !== "all") {
        params.set("lot_id", selectedLotId);
      }
      if (selectedUserId !== "all") {
        params.set("user_id", selectedUserId);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const res = await fetch(`/api/admin/offers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          offers = data.data?.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      toast.error("Failed to load offers");
    }
  }

  async function handleAccept(id: string) {
    const offer = offers.find((o) => o.id === id);
    if (!offer) return;
    selectedOffer = offer;
    showAcceptModal = true;
  }

  async function handleReject(id: string) {
    const offer = offers.find((o) => o.id === id);
    if (!offer) return;
    selectedOffer = offer;
    showRejectModal = true;
  }

  async function handleCounter(id: string) {
    const offer = offers.find((o) => o.id === id);
    if (!offer) return;
    selectedOffer = offer;
    showCounterModal = true;
  }

  async function confirmAccept(adminResponse?: string) {
    if (!selectedOffer) return;
    try {
      const res = await fetch(`/api/admin/offers/${selectedOffer.id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_response: adminResponse }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success("Offer accepted successfully");
          await fetchOffers();
        } else {
          throw new Error(data.error || "Failed to accept offer");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to accept offer");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept offer");
      throw error;
    }
  }

  async function confirmReject(adminResponse: string) {
    if (!selectedOffer) return;
    try {
      const res = await fetch(`/api/admin/offers/${selectedOffer.id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_response: adminResponse }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success("Offer rejected successfully");
          await fetchOffers();
        } else {
          throw new Error(data.error || "Failed to reject offer");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject offer");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject offer");
      throw error;
    }
  }

  async function confirmCounter(counterAmount: number, adminMessage: string) {
    if (!selectedOffer) return;
    try {
      const res = await fetch(`/api/admin/offers/${selectedOffer.id}/counter`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counter_amount: counterAmount,
          admin_response: adminMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success("Counter offer sent successfully");
          await fetchOffers();
        } else {
          throw new Error(data.error || "Failed to send counter offer");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to send counter offer");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send counter offer");
      throw error;
    }
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Pending Offers</h1>
    <p class="text-muted-foreground mt-2">
      Review and respond to pending offers from buyers
    </p>
  </div>

  <!-- Filters -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <div class="relative flex-1 max-w-sm">
      <IconSearch class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by user name..."
        bind:value={searchQuery}
        oninput={(e) => {
          searchQuery = e.currentTarget.value;
          fetchOffers();
        }}
        class="pl-9"
      />
    </div>
  </div>

  <!-- Table -->
  {#if isLoading}
    <div class="space-y-2">
      {#each Array(5) as _}
        <div class="h-16 animate-pulse rounded bg-muted"></div>
      {/each}
    </div>
  {:else if offers.length === 0}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconMoneybag />
        </Empty.Media>
        <Empty.Title>No Pending Offers</Empty.Title>
        <Empty.Description>
          {searchQuery
            ? "Try adjusting your filters to see more results."
            : "All offers have been reviewed. New offers will appear here when submitted."}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else}
    <OffersTable
      {offers}
      onAccept={handleAccept}
      onReject={handleReject}
      onCounter={handleCounter}
    />
  {/if}
</div>

<!-- Modals -->
<AcceptOfferModal
  bind:open={showAcceptModal}
  offer={selectedOffer}
  onConfirm={confirmAccept}
  onCancel={() => {
    selectedOffer = null;
  }}
/>

<RejectOfferModal
  bind:open={showRejectModal}
  offer={selectedOffer}
  onConfirm={confirmReject}
  onCancel={() => {
    selectedOffer = null;
  }}
/>

<CounterOfferModal
  bind:open={showCounterModal}
  offer={selectedOffer}
  onConfirm={confirmCounter}
  onCancel={() => {
    selectedOffer = null;
  }}
/>
