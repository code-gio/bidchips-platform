<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import LotForm from "$lib/components/admin/lots/LotForm.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Lot } from "$lib/types/lot";
  import type { Category } from "$lib/types/category";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import ConfirmDialog from "$lib/components/admin/shared/ConfirmDialog.svelte";
  import { IconTrash, IconX } from "@tabler/icons-svelte";

  let lot = $state<Lot | null>(null);
  let categories = $state<Category[]>([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let showDeleteDialog = $state(false);
  let showCancelDialog = $state(false);

  onMount(async () => {
    await Promise.all([fetchLot(), fetchCategories()]);
    isLoading = false;
  });

  async function fetchLot() {
    try {
      const lotId = $page.params.id;
      const res = await fetch(`/api/admin/lots/${lotId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          lot = data.data;
        } else {
          toast.error("Lot not found");
          goto("/admin/lots");
        }
      } else {
        toast.error("Failed to load lot");
        goto("/admin/lots");
      }
    } catch (error) {
      console.error("Failed to fetch lot:", error);
      toast.error("Failed to load lot");
      goto("/admin/lots");
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          categories = data.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function handleSave(data: Partial<Lot>, status: "draft" | "scheduled") {
    if (!lot) return;
    isSaving = true;
    try {
      const res = await fetch(`/api/admin/lots/${lot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Lot updated successfully");
          lot = result.data;
        } else {
          throw new Error(result.error || "Failed to update lot");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update lot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update lot");
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete() {
    if (!lot) return;
    try {
      const res = await fetch(`/api/admin/lots/${lot.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Lot deleted successfully");
        goto("/admin/lots");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete lot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete lot");
    }
    showDeleteDialog = false;
  }

  async function handleCancel() {
    if (!lot) return;
    try {
      const res = await fetch(`/api/admin/lots/${lot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        toast.success("Lot cancelled successfully");
        await fetchLot();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel lot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel lot");
    }
    showCancelDialog = false;
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Edit Lot</h1>
      <p class="text-muted-foreground mt-2">
        Update lot details and settings
      </p>
    </div>
    <div class="flex gap-2">
      {#if lot?.status === "active"}
        <Button
          variant="destructive"
          onclick={() => {
            showCancelDialog = true;
          }}
        >
          <IconX class="size-4" />
          Cancel Auction
        </Button>
      {/if}
      <Button
        variant="destructive"
        onclick={() => {
          showDeleteDialog = true;
        }}
      >
        <IconTrash class="size-4" />
        Delete
      </Button>
    </div>
  </div>

  {#if isLoading}
    <div class="space-y-2">
      {#each Array(5) as _}
        <div class="h-32 animate-pulse rounded bg-muted"></div>
      {/each}
    </div>
  {:else if lot}
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <LotForm {lot} {categories} onSave={handleSave} isLoading={isSaving} />
      </div>

      <div class="space-y-6">
        <!-- Current Bids -->
        {#if lot.bid_count > 0}
          <Card.Root>
            <Card.Header>
              <Card.Title>Current Bids</Card.Title>
              <Card.Description>{lot.bid_count} bid{lot.bid_count === 1 ? "" : "s"}</Card.Description>
            </Card.Header>
            <Card.Content>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Current Price</span>
                  <span class="font-medium">{formatCurrency(lot.current_price)}</span>
                </div>
                {#if lot.winning_bidder_name}
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Winning Bidder</span>
                    <span class="font-medium">{lot.winning_bidder_name}</span>
                  </div>
                {/if}
              </div>
              <Button variant="outline" href={`/admin/lots/${lot.id}/bids`} class="mt-4 w-full">
                View All Bids
              </Button>
            </Card.Content>
          </Card.Root>
        {/if}

        <!-- Lot Info -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Lot Information</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Status</span>
              <span class="font-medium capitalize">{lot.status}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Created</span>
              <span class="font-medium">
                {new Date(lot.created_at).toLocaleDateString()}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Views</span>
              <span class="font-medium">{lot.view_count}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Watchlist</span>
              <span class="font-medium">{lot.watch_count}</span>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  {/if}
</div>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Lot"
  description="Are you sure you want to delete this lot? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  onConfirm={handleDelete}
/>

<!-- Cancel Auction Confirmation -->
<ConfirmDialog
  bind:open={showCancelDialog}
  title="Cancel Auction"
  description="Are you sure you want to cancel this active auction? This will stop all bidding."
  variant="danger"
  confirmText="Cancel Auction"
  onConfirm={handleCancel}
/>

