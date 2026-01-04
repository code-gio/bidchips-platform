<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import type { Category } from "$lib/types/category";
  import { IconDotsVertical, IconEdit, IconTrash, IconGripVertical } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    categories: Category[];
    onEdit?: (category: Category) => void;
    onDelete?: (id: string) => Promise<void>;
    onToggleActive?: (id: string, isActive: boolean) => Promise<void>;
  }

  let {
    categories,
    onEdit,
    onDelete,
    onToggleActive,
  }: Props = $props();

  async function handleToggleActive(category: Category) {
    if (onToggleActive) {
      try {
        await onToggleActive(category.id, !category.is_active);
        toast.success(
          `Category ${!category.is_active ? "activated" : "deactivated"}`
        );
      } catch (error) {
        toast.error("Failed to update category");
      }
    }
  }

  async function handleDelete(id: string) {
    if (onDelete) {
      try {
        await onDelete(id);
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  }
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-12"></Table.Head>
      <Table.Head>Icon</Table.Head>
      <Table.Head>Name</Table.Head>
      <Table.Head>Slug</Table.Head>
      <Table.Head class="text-right">Lot Count</Table.Head>
      <Table.Head>Active</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if categories.length === 0}
      <Table.Row>
        <Table.Cell colspan="7" class="h-24 text-center text-muted-foreground">
          No categories found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each categories as category}
        <Table.Row>
          <Table.Cell>
            <IconGripVertical class="size-4 text-muted-foreground cursor-move" />
          </Table.Cell>
          <Table.Cell>
            {#if category.icon}
              <div class="size-8 rounded flex items-center justify-center text-lg">
                {category.icon}
              </div>
            {:else}
              <div class="size-8 rounded bg-muted flex items-center justify-center text-xs">
                {category.name.charAt(0)}
              </div>
            {/if}
          </Table.Cell>
          <Table.Cell>
            <div class="font-medium">{category.name}</div>
            {#if category.description}
              <div class="text-xs text-muted-foreground max-w-[200px] truncate">
                {category.description}
              </div>
            {/if}
          </Table.Cell>
          <Table.Cell class="text-sm text-muted-foreground font-mono">
            {category.slug}
          </Table.Cell>
          <Table.Cell class="text-right">
            <div class="font-medium">{category.lot_count}</div>
            <div class="text-xs text-muted-foreground">
              {category.active_lot_count} active
            </div>
          </Table.Cell>
          <Table.Cell>
            <Checkbox.Root
              checked={category.is_active}
              onCheckedChange={() => handleToggleActive(category)}
            />
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
                <DropdownMenu.Item onclick={() => onEdit?.(category)}>
                  <IconEdit class="size-4" />
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onclick={() => handleDelete(category.id)}
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

