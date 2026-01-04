<script lang="ts">
  import { onMount } from "svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import BidsTable from "$lib/components/admin/bids/BidsTable.svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import type { Bid } from "$lib/types/bid";
  import { IconSearch, IconGavel } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  interface BidWithLot extends Bid {
    lot_title?: string | null;
  }

  let bids = $state<BidWithLot[]>([]);
  let isLoading = $state(true);
  let selectedStatus = $state<string>("all");
  let searchQuery = $state("");
  let selectedLotId = $state<string>("all");
  let selectedUserId = $state<string>("all");
  let startDate = $state("");
  let endDate = $state("");

  onMount(async () => {
    await fetchBids();
    isLoading = false;
  });

  async function fetchBids() {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.set("status", selectedStatus);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (selectedLotId !== "all") {
        params.set("lot_id", selectedLotId);
      }
      if (selectedUserId !== "all") {
        params.set("user_id", selectedUserId);
      }
      if (startDate) {
        params.set("start_date", startDate);
      }
      if (endDate) {
        params.set("end_date", endDate);
      }

      const res = await fetch(`/api/admin/bids?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          bids = data.data?.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      toast.error("Failed to load bids");
    }
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">All Bids</h1>
    <p class="text-muted-foreground mt-2">
      View and manage all bids across all auctions
    </p>
  </div>

  <!-- Filters -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <div class="relative flex-1 max-w-sm">
      <IconSearch class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by bidder name..."
        bind:value={searchQuery}
        oninput={(e) => {
          searchQuery = e.currentTarget.value;
          fetchBids();
        }}
        class="pl-9"
      />
    </div>

    <Select.Root bind:selected={selectedStatus} onSelectedChange={(v) => {
      selectedStatus = v?.value || "all";
      fetchBids();
    }}>
      <Select.Trigger class="w-[180px]">
        <Select.Value placeholder="All Statuses" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">All Statuses</Select.Item>
        <Select.Item value="active">Active</Select.Item>
        <Select.Item value="outbid">Outbid</Select.Item>
        <Select.Item value="won">Won</Select.Item>
        <Select.Item value="lost">Lost</Select.Item>
      </Select.Content>
    </Select.Root>

    <Input
      type="date"
      bind:value={startDate}
      placeholder="Start Date"
      oninput={() => fetchBids()}
      class="w-[180px]"
    />

    <Input
      type="date"
      bind:value={endDate}
      placeholder="End Date"
      oninput={() => fetchBids()}
      class="w-[180px]"
    />
  </div>

  <!-- Table -->
  {#if isLoading}
    <div class="space-y-2">
      {#each Array(5) as _}
        <div class="h-16 animate-pulse rounded bg-muted"></div>
      {/each}
    </div>
  {:else if bids.length === 0}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconGavel />
        </Empty.Media>
        <Empty.Title>No Bids Found</Empty.Title>
        <Empty.Description>
          {searchQuery || selectedStatus !== "all"
            ? "Try adjusting your filters to see more results."
            : "No bids have been placed yet."}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else}
    <BidsTable {bids} />
  {/if}
</div>
