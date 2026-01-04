<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { Offer } from "$lib/types/offer";
  import { IconDotsVertical, IconCheck, IconX, IconMessageCircle } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";

  interface Props {
    offers: Offer[];
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onCounter?: (id: string) => void;
  }

  let {
    offers,
    onAccept,
    onReject,
    onCounter,
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

  const statusConfig: Record<
    Offer["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    pending: { label: "Pending", variant: "outline" },
    accepted: { label: "Accepted", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
    countered: { label: "Countered", variant: "secondary" },
    withdrawn: { label: "Withdrawn", variant: "outline" },
  };

  function getStatusConfig(status: Offer["status"]) {
    return statusConfig[status] || statusConfig.pending;
  }
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>User</Table.Head>
      <Table.Head>Lot</Table.Head>
      <Table.Head class="text-right">Amount</Table.Head>
      <Table.Head>Message</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head>Timestamp</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if offers.length === 0}
      <Table.Row>
        <Table.Cell colspan="7" class="h-24 text-center text-muted-foreground">
          No offers found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each offers as offer}
        <Table.Row>
          <Table.Cell>
            <div class="font-medium">{offer.user_name || "Unknown"}</div>
            <div class="text-xs text-muted-foreground">{offer.user_email || ""}</div>
          </Table.Cell>
          <Table.Cell>
            <div class="max-w-[200px] truncate font-medium">{offer.lot_title || "N/A"}</div>
          </Table.Cell>
          <Table.Cell class="text-right font-medium">
            {formatCurrency(offer.amount)}
          </Table.Cell>
          <Table.Cell>
            {#if offer.message}
              <div class="max-w-[200px] truncate text-sm text-muted-foreground">
                {offer.message}
              </div>
            {:else}
              <span class="text-muted-foreground">-</span>
            {/if}
          </Table.Cell>
          <Table.Cell>
            {@const config = getStatusConfig(offer.status)}
            <Badge.Root variant={config.variant}>{config.label}</Badge.Root>
          </Table.Cell>
          <Table.Cell class="text-sm text-muted-foreground">
            {formatDate(offer.created_at)}
          </Table.Cell>
          <Table.Cell>
            {#if offer.status === "pending"}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button variant="ghost" size="icon" builders={[builder]}>
                    <IconDotsVertical class="size-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item onclick={() => onAccept?.(offer.id)}>
                    <IconCheck class="size-4" />
                    Accept
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onclick={() => onCounter?.(offer.id)}>
                    <IconMessageCircle class="size-4" />
                    Counter
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    onclick={() => onReject?.(offer.id)}
                    class="text-destructive focus:text-destructive"
                  >
                    <IconX class="size-4" />
                    Reject
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            {:else}
              <Button
                variant="ghost"
                size="sm"
                onclick={() => goto(`/browse/${offer.lot_id}`)}
              >
                View Lot
              </Button>
            {/if}
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>

