<script lang="ts">
  import { onMount } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import LotsTable from "$lib/components/admin/lots/LotsTable.svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import type { Lot } from "$lib/types/lot";
  import type { Category } from "$lib/types/category";
  import { IconPlus, IconSearch, IconHammer } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import ConfirmDialog from "$lib/components/admin/shared/ConfirmDialog.svelte";

  type LotStatus = Lot["status"] | "all";

  let lots = $state<Lot[]>([]);
  let categories = $state<Category[]>([]);
  let isLoading = $state(true);
  let selectedStatus: LotStatus = $state("all");
  let searchQuery = $state("");
  let selectedCategory = $state<string>("all");
  let selectedIds = $state<string[]>([]);
  let showDeleteDialog = $state(false);
  let showPublishDialog = $state(false);
  let showCancelDialog = $state(false);
  let actionLotId = $state<string | null>(null);

  onMount(async () => {
    await Promise.all([fetchLots(), fetchCategories()]);
    isLoading = false;
  });

  async function fetchLots() {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.set("status", selectedStatus);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (selectedCategory !== "all") {
        params.set("category_id", selectedCategory);
      }

      const res = await fetch(`/api/admin/lots?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          lots = data.data?.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch lots:", error);
      toast.error("Failed to load lots");
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

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/lots/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchLots();
        selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      throw error;
    }
  }

  async function handlePublish(id: string) {
    try {
      const res = await fetch(`/api/admin/lots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      });
      if (res.ok) {
        await fetchLots();
      } else {
        throw new Error("Failed to publish");
      }
    } catch (error) {
      throw error;
    }
  }

  async function handleCancel(id: string) {
    try {
      const res = await fetch(`/api/admin/lots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        await fetchLots();
      } else {
        throw new Error("Failed to cancel");
      }
    } catch (error) {
      throw error;
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => handleDelete(id)));
      selectedIds = [];
      toast.success("Lots deleted successfully");
    } catch (error) {
      toast.error("Failed to delete some lots");
    }
    showDeleteDialog = false;
  }

  async function handleBulkPublish() {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => handlePublish(id)));
      selectedIds = [];
      toast.success("Lots published successfully");
    } catch (error) {
      toast.error("Failed to publish some lots");
    }
    showPublishDialog = false;
  }

  // Note: Filter changes are handled manually in UI handlers to avoid $effect circular loops
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">All Lots</h1>
      <p class="text-muted-foreground mt-2">
        Manage all auction lots and their status
      </p>
    </div>
    <Button href="/admin/lots/new">
      <IconPlus class="size-4" />
      Create New Lot
    </Button>
  </div>

  <!-- Filters -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <Tabs.Root bind:value={selectedStatus} onValueChange={(v) => {
      selectedStatus = v as LotStatus;
      fetchLots();
    }}>
      <Tabs.List>
        <Tabs.Trigger value="all">All</Tabs.Trigger>
        <Tabs.Trigger value="draft">Draft</Tabs.Trigger>
        <Tabs.Trigger value="scheduled">Scheduled</Tabs.Trigger>
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="sold">Sold</Tabs.Trigger>
        <Tabs.Trigger value="unsold">Unsold</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <div class="flex flex-1 gap-2">
      <div class="relative flex-1 max-w-sm">
        <IconSearch class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or MPN..."
          bind:value={searchQuery}
          oninput={(e) => {
            searchQuery = e.currentTarget.value;
            fetchLots();
          }}
          class="pl-9"
        />
      </div>

      <Select.Root bind:selected={selectedCategory} onSelectedChange={(v) => {
        selectedCategory = v?.value || "all";
        fetchLots();
      }}>
        <Select.Trigger class="w-[180px]">
          <Select.Value placeholder="All Categories" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">All Categories</Select.Item>
          {#each categories as category}
            <Select.Item value={category.id}>{category.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  <!-- Bulk Actions -->
  {#if selectedIds.length > 0}
    <div class="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <span class="text-sm font-medium">
        {selectedIds.length} lot{selectedIds.length === 1 ? "" : "s"} selected
      </span>
      <div class="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          on:click={() => {
            showPublishDialog = true;
          }}
        >
          Publish Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          on:click={() => {
            showDeleteDialog = true;
          }}
        >
          Delete Selected
        </Button>
      </div>
    </div>
  {/if}

  <!-- Table -->
  {#if isLoading}
    <div class="space-y-2">
      {#each Array(5) as _}
        <div class="h-16 animate-pulse rounded bg-muted"></div>
      {/each}
    </div>
  {:else if lots.length === 0}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconHammer />
        </Empty.Media>
        <Empty.Title>No Lots Found</Empty.Title>
        <Empty.Description>
          {searchQuery || selectedStatus !== "all"
            ? "Try adjusting your filters to see more results."
            : "Get started by creating your first auction lot."}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        {#if !searchQuery && selectedStatus === "all"}
          <Button href="/admin/lots/new">Create New Lot</Button>
        {/if}
      </Empty.Content>
    </Empty.Root>
  {:else}
    <LotsTable
      {lots}
      bind:selectedIds
      onSelectionChange={(ids) => {
        selectedIds = ids;
      }}
      onDelete={handleDelete}
      onPublish={handlePublish}
      onCancel={handleCancel}
    />
  {/if}
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Selected Lots"
  description="Are you sure you want to delete {selectedIds.length} lot{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  onConfirm={handleBulkDelete}
/>

<!-- Publish Confirmation Dialog -->
<ConfirmDialog
  bind:open={showPublishDialog}
  title="Publish Selected Lots"
  description="Are you sure you want to publish {selectedIds.length} lot{selectedIds.length === 1 ? '' : 's'}? They will be scheduled for auction."
  variant="info"
  confirmText="Publish"
  onConfirm={handleBulkPublish}
/>
