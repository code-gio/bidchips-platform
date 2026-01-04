<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Bid } from "$lib/types/bid";
  import { IconExternalLink } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";

  interface BidWithLot extends Bid {
    lot_title?: string | null;
  }

  interface Props {
    bids: BidWithLot[];
  }

  let { bids }: Props = $props();

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
    Bid["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: "Active", variant: "default" },
    outbid: { label: "Outbid", variant: "secondary" },
    won: { label: "Won", variant: "default" },
    lost: { label: "Lost", variant: "outline" },
  };

  function getStatusConfig(status: Bid["status"]) {
    return statusConfig[status] || statusConfig.lost;
  }

  function exportToCSV() {
    const headers = ["Lot Title", "Bidder", "Amount", "Status", "Timestamp"];
    const rows = bids.map((bid) => [
      bid.lots?.title || "N/A",
      bid.user_name || "Unknown",
      formatCurrency(bid.amount),
      getStatusConfig(bid.status).label,
      formatDate(bid.created_at),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bids-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-4">
  <div class="flex justify-end">
    <Button variant="outline" size="sm" onclick={exportToCSV}>
      Export to CSV
    </Button>
  </div>

  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Lot Title</Table.Head>
        <Table.Head>Bidder</Table.Head>
        <Table.Head class="text-right">Amount</Table.Head>
        <Table.Head>Status</Table.Head>
        <Table.Head>Timestamp</Table.Head>
        <Table.Head class="w-12"></Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#if bids.length === 0}
        <Table.Row>
          <Table.Cell colspan="6" class="h-24 text-center text-muted-foreground">
            No bids found
          </Table.Cell>
        </Table.Row>
      {:else}
        {#each bids as bid}
          <Table.Row>
            <Table.Cell>
              <div class="font-medium max-w-[200px] truncate">
                {bid.lot_title || `Lot ${bid.lot_id.slice(0, 8)}...`}
              </div>
            </Table.Cell>
            <Table.Cell>
              <Button
                variant="link"
                class="h-auto p-0 font-normal"
                onclick={() => goto(`/admin/users/${bid.user_id}`)}
              >
                {bid.user_name || "Unknown"}
              </Button>
            </Table.Cell>
            <Table.Cell class="text-right font-medium">
              {formatCurrency(bid.amount)}
            </Table.Cell>
            <Table.Cell>
              {@const config = getStatusConfig(bid.status)}
              <Badge.Root variant={config.variant}>{config.label}</Badge.Root>
            </Table.Cell>
            <Table.Cell class="text-sm text-muted-foreground">
              {formatDate(bid.created_at)}
            </Table.Cell>
            <Table.Cell>
              <Button
                variant="ghost"
                size="icon"
                onclick={() => goto(`/browse/${bid.lot_id}`)}
              >
                <IconExternalLink class="size-4" />
                <span class="sr-only">View Lot</span>
              </Button>
            </Table.Cell>
          </Table.Row>
        {/each}
      {/if}
    </Table.Body>
  </Table.Root>
</div>

