<script lang="ts">
  import { onMount } from "svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ActivityTable from "$lib/components/admin/activity-log/ActivityTable.svelte";
  import type { ActivityLog } from "$lib/types/activity-log";
  import { IconSearch, IconDownload, IconHistory } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  let activities = $state<ActivityLog[]>([]);
  let filteredActivities = $state<ActivityLog[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let selectedAction = $state<string>("all");
  let selectedResource = $state<string>("all");

  const actionOptions = [
    { value: "all", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "ban", label: "Ban" },
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
  ];

  const resourceOptions = [
    { value: "all", label: "All Resources" },
    { value: "lot", label: "Lots" },
    { value: "user", label: "Users" },
    { value: "category", label: "Categories" },
    { value: "offer", label: "Offers" },
    { value: "sales_record", label: "Sales" },
  ];

  onMount(async () => {
    await fetchActivities();
    isLoading = false;
  });

  async function fetchActivities() {
    try {
      const params = new URLSearchParams();
      if (selectedAction !== "all") {
        params.append("action", selectedAction);
      }
      if (selectedResource !== "all") {
        params.append("resource", selectedResource);
      }

      const res = await fetch(`/api/admin/activity-log?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          activities = Array.isArray(data.data) ? data.data : (data.data?.data || []);
          applyFilters();
        }
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error("Failed to load activity log");
    }
  }

  function applyFilters() {
    let filtered = [...activities];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.user_name?.toLowerCase().includes(query) ||
          activity.action.toLowerCase().includes(query) ||
          activity.resource.toLowerCase().includes(query) ||
          activity.description?.toLowerCase().includes(query)
      );
    }

    filteredActivities = filtered;
  }

  $effect(() => {
    applyFilters();
  });

  $effect(() => {
    fetchActivities();
  });

  function exportToCSV() {
    const headers = ["Timestamp", "User", "Action", "Resource", "Description", "IP Address"];
    const rows = filteredActivities.map((activity) => [
      new Date(activity.created_at).toLocaleString(),
      activity.user_name || "System",
      activity.action,
      activity.resource,
      activity.description || "",
      activity.ip_address || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Activity log exported to CSV");
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Activity Log</h1>
      <p class="text-muted-foreground mt-2">
        View and track all system activities and changes
      </p>
    </div>
    <Button variant="outline" onclick={exportToCSV}>
      <IconDownload class="size-4" />
      Export to CSV
    </Button>
  </div>

  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col gap-4 sm:flex-row">
      <div class="relative flex-1">
        <IconSearch class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by user, action, resource, or description..."
          bind:value={searchQuery}
          class="pl-9"
        />
      </div>
      <Select.Root bind:selected={selectedAction} onSelectedChange={(v) => {
        selectedAction = v?.value || "all";
      }}>
        <Select.Trigger class="w-[180px]">
          <Select.Value placeholder="All Actions" />
        </Select.Trigger>
        <Select.Content>
          {#each actionOptions as option}
            <Select.Item value={option.value}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <Select.Root bind:selected={selectedResource} onSelectedChange={(v) => {
        selectedResource = v?.value || "all";
      }}>
        <Select.Trigger class="w-[180px]">
          <Select.Value placeholder="All Resources" />
        </Select.Trigger>
        <Select.Content>
          {#each resourceOptions as option}
            <Select.Item value={option.value}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <!-- Activity Table -->
    {#if isLoading}
      <div class="space-y-2">
        {#each Array(10) as _}
          <div class="h-16 animate-pulse rounded bg-muted"></div>
        {/each}
      </div>
    {:else if filteredActivities.length === 0}
      <Empty.Root>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconHistory />
          </Empty.Media>
          <Empty.Title>No Activity Found</Empty.Title>
          <Empty.Description>
            {#if searchQuery || selectedAction !== "all" || selectedResource !== "all"}
              No activities match your filters. Try adjusting your search criteria.
            {:else}
              No activity has been recorded yet.
            {/if}
          </Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <ActivityTable activities={filteredActivities} />
    {/if}
  </div>
</div>
