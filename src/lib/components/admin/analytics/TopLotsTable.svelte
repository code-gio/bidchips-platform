<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { formatCurrency } from "$lib/utils";
  import { goto } from "$app/navigation";

  interface TopLot {
    id: string;
    title: string;
    thumbnail_url: string | null;
    final_price: number;
    bid_count: number;
    winner_name: string | null;
    winner_email: string | null;
  }

  interface Props {
    lots: TopLot[];
    loading?: boolean;
  }

  let { lots, loading = false }: Props = $props();
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Top Performing Lots</Card.Title>
    <Card.Description>Top 10 lots by revenue</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if loading}
      <div class="space-y-2">
        {#each Array(5) as _}
          <div class="h-12 animate-pulse rounded bg-muted"></div>
        {/each}
      </div>
    {:else if lots.length === 0}
      <div class="py-8 text-center text-muted-foreground">No lots found</div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-12">Rank</Table.Head>
            <Table.Head>Lot</Table.Head>
            <Table.Head class="text-right">Final Price</Table.Head>
            <Table.Head class="text-right">Bids</Table.Head>
            <Table.Head>Winner</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each lots as lot, index}
            <Table.Row
              class="cursor-pointer"
              onclick={() => goto(`/admin/lots/${lot.id}`)}
            >
              <Table.Cell class="font-medium">#{index + 1}</Table.Cell>
              <Table.Cell>
                <div class="flex items-center gap-3">
                  <Avatar.Root class="size-10 rounded-md">
                    <Avatar.Image src={lot.thumbnail_url || undefined} alt={lot.title} />
                    <Avatar.Fallback>{lot.title.charAt(0)}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="max-w-[200px] truncate font-medium">{lot.title}</div>
                </div>
              </Table.Cell>
              <Table.Cell class="text-right font-medium">
                {formatCurrency(lot.final_price)}
              </Table.Cell>
              <Table.Cell class="text-right">{lot.bid_count}</Table.Cell>
              <Table.Cell class="text-sm text-muted-foreground">
                {lot.winner_name || lot.winner_email || "N/A"}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </Card.Content>
</Card.Root>

