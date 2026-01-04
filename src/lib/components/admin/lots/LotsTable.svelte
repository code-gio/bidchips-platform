<script lang="ts">
  import { onMount } from "svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import LotStatusBadge from "./LotStatusBadge.svelte";
  import type { Lot } from "$lib/types/lot";
  import { IconDotsVertical, IconEdit, IconTrash, IconEye, IconX } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  interface Props {
    lots: Lot[];
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    onDelete?: (id: string) => Promise<void>;
    onPublish?: (id: string) => Promise<void>;
    onCancel?: (id: string) => Promise<void>;
  }

  let {
    lots,
    selectedIds = $bindable([]),
    onSelectionChange,
    onDelete,
    onPublish,
    onCancel,
  }: Props = $props();

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
    onSelectionChange?.(selectedIds);
  }

  function toggleSelectAll() {
    if (selectedIds.length === lots.length) {
      selectedIds = [];
    } else {
      selectedIds = lots.map((lot) => lot.id);
    }
    onSelectionChange?.(selectedIds);
  }

  async function handleDelete(id: string) {
    if (onDelete) {
      try {
        await onDelete(id);
        toast.success("Lot deleted successfully");
      } catch (error) {
        toast.error("Failed to delete lot");
      }
    }
  }

  async function handlePublish(id: string) {
    if (onPublish) {
      try {
        await onPublish(id);
        toast.success("Lot published successfully");
      } catch (error) {
        toast.error("Failed to publish lot");
      }
    }
  }

  async function handleCancel(id: string) {
    if (onCancel) {
      try {
        await onCancel(id);
        toast.success("Lot cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel lot");
      }
    }
  }

  let allSelected = $derived(lots.length > 0 && selectedIds.length === lots.length);
  let someSelected = $derived(selectedIds.length > 0 && selectedIds.length < lots.length);
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-12">
        <Checkbox.Root
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={toggleSelectAll}
        />
      </Table.Head>
      <Table.Head class="w-16">Image</Table.Head>
      <Table.Head>Title</Table.Head>
      <Table.Head>MPN</Table.Head>
      <Table.Head>Category</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head class="text-right">Price</Table.Head>
      <Table.Head class="text-right">Bids</Table.Head>
      <Table.Head>End Time</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if lots.length === 0}
      <Table.Row>
        <Table.Cell colspan="10" class="h-24 text-center text-muted-foreground">
          No lots found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each lots as lot}
        <Table.Row>
          <Table.Cell>
            <Checkbox.Root
              checked={selectedIds.includes(lot.id)}
              onCheckedChange={() => toggleSelection(lot.id)}
            />
          </Table.Cell>
          <Table.Cell>
            {#if lot.thumbnail_url}
              <Avatar.Root class="size-10">
                <Avatar.Image src={lot.thumbnail_url} alt={lot.title} />
                <Avatar.Fallback>{lot.title.charAt(0)}</Avatar.Fallback>
              </Avatar.Root>
            {:else}
              <div class="size-10 rounded bg-muted flex items-center justify-center text-xs">
                {lot.title.charAt(0)}
              </div>
            {/if}
          </Table.Cell>
          <Table.Cell>
            <div class="font-medium max-w-[200px] truncate">{lot.title}</div>
          </Table.Cell>
          <Table.Cell class="text-muted-foreground text-sm">
            {lot.mpn || "-"}
          </Table.Cell>
          <Table.Cell class="text-sm">{lot.category_id || "-"}</Table.Cell>
          <Table.Cell>
            <LotStatusBadge status={lot.status} />
          </Table.Cell>
          <Table.Cell class="text-right font-medium">
            {formatCurrency(lot.current_price)}
          </Table.Cell>
          <Table.Cell class="text-right">{lot.bid_count}</Table.Cell>
          <Table.Cell class="text-sm text-muted-foreground">
            {formatDate(lot.end_time)}
          </Table.Cell>
          <Table.Cell>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild let:builder>
                <Button variant="ghost" size="icon" builders={[builder]}>
                  <IconDotsVertical class="size-4" />
                  <span class="sr-only">Actions</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item
                  onclick={() => goto(`/admin/lots/${lot.id}`)}
                >
                  <IconEdit class="size-4" />
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onclick={() => goto(`/browse/${lot.id}`)}
                >
                  <IconEye class="size-4" />
                  View
                </DropdownMenu.Item>
                {#if lot.status === "draft"}
                  <DropdownMenu.Item onclick={() => handlePublish(lot.id)}>
                    Publish
                  </DropdownMenu.Item>
                {/if}
                {#if lot.status === "active"}
                  <DropdownMenu.Item onclick={() => handleCancel(lot.id)}>
                    <IconX class="size-4" />
                    Cancel
                  </DropdownMenu.Item>
                {/if}
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onclick={() => handleDelete(lot.id)}
                  class="text-destructive focus:text-destructive"
                >
                  <IconTrash class="size-4" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>

