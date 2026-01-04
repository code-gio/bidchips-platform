<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { SalesRecord } from "$lib/types/sales-record";
  import { IconDotsVertical, IconEye, IconCheck, IconTruck, IconFileText } from "@tabler/icons-svelte";
  import { formatCurrency, formatDate } from "$lib/utils";

  interface Props {
    sales: SalesRecord[];
    onView?: (sale: SalesRecord) => void;
    onMarkPaid?: (sale: SalesRecord) => void;
    onMarkShipped?: (sale: SalesRecord) => void;
  }

  let {
    sales,
    onView,
    onMarkPaid,
    onMarkShipped,
  }: Props = $props();

  function getPaymentStatusVariant(status: SalesRecord["payment_status"]) {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  }

  function getShippingStatusVariant(status: SalesRecord["shipping_status"]) {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  }
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Sale Date</Table.Head>
      <Table.Head>Lot Title</Table.Head>
      <Table.Head>Buyer</Table.Head>
      <Table.Head class="text-right">Sale Price</Table.Head>
      <Table.Head>Payment Status</Table.Head>
      <Table.Head>Shipping Status</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if sales.length === 0}
      <Table.Row>
        <Table.Cell colspan="7" class="h-24 text-center text-muted-foreground">
          No sales records found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each sales as sale}
        <Table.Row>
          <Table.Cell class="text-sm text-muted-foreground">
            {formatDate(sale.created_at)}
          </Table.Cell>
          <Table.Cell>
            <div class="font-medium max-w-[200px] truncate">{sale.lot_title}</div>
            {#if sale.lot_mpn}
              <div class="text-xs text-muted-foreground">MPN: {sale.lot_mpn}</div>
            {/if}
          </Table.Cell>
          <Table.Cell>
            <div class="text-sm">{sale.user_name || "Unknown"}</div>
            <div class="text-xs text-muted-foreground">{sale.user_email}</div>
          </Table.Cell>
          <Table.Cell class="text-right font-medium">
            {formatCurrency(sale.sale_price)}
          </Table.Cell>
          <Table.Cell>
            <Badge.Root variant={getPaymentStatusVariant(sale.payment_status)}>
              {sale.payment_status === "paid" ? "Paid" : sale.payment_status === "overdue" ? "Overdue" : "Pending"}
            </Badge.Root>
          </Table.Cell>
          <Table.Cell>
            <Badge.Root variant={getShippingStatusVariant(sale.shipping_status)}>
              {sale.shipping_status === "delivered" ? "Delivered" : sale.shipping_status === "shipped" ? "Shipped" : "Pending"}
            </Badge.Root>
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
                <DropdownMenu.Item onclick={() => onView?.(sale)}>
                  <IconEye class="size-4" />
                  View Details
                </DropdownMenu.Item>
                {#if sale.payment_status !== "paid"}
                  <DropdownMenu.Item onclick={() => onMarkPaid?.(sale)}>
                    <IconCheck class="size-4" />
                    Mark as Paid
                  </DropdownMenu.Item>
                {/if}
                {#if sale.shipping_status === "pending" && sale.payment_status === "paid"}
                  <DropdownMenu.Item onclick={() => onMarkShipped?.(sale)}>
                    <IconTruck class="size-4" />
                    Mark as Shipped
                  </DropdownMenu.Item>
                {/if}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>

