<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import type { ActivityLog } from "$lib/types/activity-log";
  import { IconEye } from "@tabler/icons-svelte";
  import { formatDate } from "$lib/utils";
  import { goto } from "$app/navigation";

  interface Props {
    activities: ActivityLog[];
    onViewDetails?: (activity: ActivityLog) => void;
  }

  let {
    activities,
    onViewDetails,
  }: Props = $props();

  let showDetails = $state(false);
  let selectedActivity = $state<ActivityLog | null>(null);

  function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
    if (action.includes("create") || action.includes("accept")) return "default";
    if (action.includes("delete") || action.includes("ban") || action.includes("reject")) return "destructive";
    if (action.includes("update") || action.includes("edit")) return "secondary";
    return "outline";
  }

  function getResourceUrl(activity: ActivityLog): string | null {
    if (!activity.resource_id) return null;
    
    switch (activity.resource) {
      case "lot":
        return `/admin/lots/${activity.resource_id}`;
      case "user":
        return `/admin/users`;
      case "category":
        return `/admin/categories`;
      case "offer":
        return `/admin/offers/pending`;
      case "sales_record":
        return `/admin/sales`;
      default:
        return null;
    }
  }

  function handleViewDetails(activity: ActivityLog) {
    selectedActivity = activity;
    showDetails = true;
    onViewDetails?.(activity);
  }
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Timestamp</Table.Head>
      <Table.Head>User</Table.Head>
      <Table.Head>Action</Table.Head>
      <Table.Head>Resource</Table.Head>
      <Table.Head>Description</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if activities.length === 0}
      <Table.Row>
        <Table.Cell colspan="6" class="h-24 text-center text-muted-foreground">
          No activity found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each activities as activity}
        <Table.Row>
          <Table.Cell class="text-sm text-muted-foreground">
            {formatDate(activity.created_at)}
          </Table.Cell>
          <Table.Cell>
            <div class="text-sm">
              {activity.user_name || "System"}
            </div>
            {#if activity.user_role}
              <div class="text-xs text-muted-foreground capitalize">{activity.user_role}</div>
            {/if}
          </Table.Cell>
          <Table.Cell>
            <Badge.Root variant={getActionVariant(activity.action)}>
              {activity.action.replace(/_/g, " ")}
            </Badge.Root>
          </Table.Cell>
          <Table.Cell>
            {#if getResourceUrl(activity)}
              <button
                type="button"
                class="text-sm text-primary hover:underline"
                onclick={() => {
                  const url = getResourceUrl(activity);
                  if (url) goto(url);
                }}
              >
                {activity.resource}
              </button>
            {:else}
              <span class="text-sm capitalize">{activity.resource || "N/A"}</span>
            {/if}
          </Table.Cell>
          <Table.Cell class="max-w-[300px] truncate text-sm text-muted-foreground">
            {activity.description || "—"}
          </Table.Cell>
          <Table.Cell>
            <Button
              variant="ghost"
              size="icon"
              onclick={() => handleViewDetails(activity)}
            >
              <IconEye class="size-4" />
              <span class="sr-only">View details</span>
            </Button>
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>

<!-- Details Drawer -->
<Drawer.Root bind:open={showDetails}>
  <Drawer.Content class="sm:max-w-2xl">
    <Drawer.Header>
      <Drawer.Title>Activity Details</Drawer.Title>
      <Drawer.Description>
        View complete information about this activity
      </Drawer.Description>
    </Drawer.Header>

    {#if selectedActivity}
      <div class="space-y-4 px-4 pb-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Timestamp</p>
            <p class="text-sm">{formatDate(selectedActivity.created_at)}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">User</p>
            <p class="text-sm">{selectedActivity.user_name || "System"}</p>
            {#if selectedActivity.user_role}
              <p class="text-xs text-muted-foreground capitalize">{selectedActivity.user_role}</p>
            {/if}
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Action</p>
            <Badge.Root variant={getActionVariant(selectedActivity.action)}>
              {selectedActivity.action.replace(/_/g, " ")}
            </Badge.Root>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Resource</p>
            <p class="text-sm capitalize">{selectedActivity.resource || "N/A"}</p>
            {#if selectedActivity.resource_id}
              <p class="text-xs text-muted-foreground font-mono">{selectedActivity.resource_id}</p>
            {/if}
          </div>
        </div>

        {#if selectedActivity.description}
          <div>
            <p class="text-sm font-medium text-muted-foreground">Description</p>
            <p class="text-sm">{selectedActivity.description}</p>
          </div>
        {/if}

        {#if selectedActivity.changes && Object.keys(selectedActivity.changes).length > 0}
          <div>
            <p class="text-sm font-medium text-muted-foreground mb-2">Changes</p>
            <pre class="rounded-lg border bg-muted p-4 text-xs overflow-auto max-h-[300px]">
{JSON.stringify(selectedActivity.changes, null, 2)}
            </pre>
          </div>
        {/if}

        <div class="grid gap-4 sm:grid-cols-2">
          {#if selectedActivity.ip_address}
            <div>
              <p class="text-sm font-medium text-muted-foreground">IP Address</p>
              <p class="text-sm font-mono">{selectedActivity.ip_address}</p>
            </div>
          {/if}
          {#if selectedActivity.user_agent}
            <div>
              <p class="text-sm font-medium text-muted-foreground">User Agent</p>
              <p class="text-xs text-muted-foreground break-words">{selectedActivity.user_agent}</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-end">
      <Button variant="outline" onclick={() => {
        showDetails = false;
        selectedActivity = null;
      }}>
        Close
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

