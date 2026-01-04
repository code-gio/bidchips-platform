<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SalesRecord } from "$lib/types/sales-record";
  import { formatCurrency, formatDate } from "$lib/utils";
  import { IconEdit } from "@tabler/icons-svelte";

  interface Props {
    open?: boolean;
    sale: SalesRecord | null;
    onEdit?: () => void;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    sale,
    onEdit,
    onCancel,
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

  function getFullShippingAddress(sale: SalesRecord): string {
    const parts = [
      sale.shipping_street,
      sale.shipping_city,
      sale.shipping_state,
      sale.shipping_zip,
      sale.shipping_country,
    ].filter(Boolean);
    return parts.join(", ") || "No shipping address on file";
  }
</script>

<Drawer.Root bind:open>
  <Drawer.Content class="sm:max-w-2xl">
    <Drawer.Header>
      <Drawer.Title>Sale Details</Drawer.Title>
      <Drawer.Description>
        View complete information about this sale
      </Drawer.Description>
    </Drawer.Header>

    {#if sale}
      <div class="space-y-6 px-4 pb-4">
        <!-- Sale Information -->
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <Card.Title>Sale Information</Card.Title>
              <Button variant="ghost" size="icon" onclick={onEdit}>
                <IconEdit class="size-4" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Lot Title</p>
              <p class="text-sm font-medium">{sale.lot_title}</p>
              {#if sale.lot_mpn}
                <p class="text-xs text-muted-foreground mt-1">MPN: {sale.lot_mpn}</p>
              {/if}
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Buyer</p>
              <p class="text-sm">{sale.user_name || "Unknown"}</p>
              <p class="text-xs text-muted-foreground">{sale.user_email}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Sale Type</p>
              <Badge variant="outline">
                {sale.sale_type === "auction_win" ? "Auction Win" : "Offer Accepted"}
              </Badge>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Sale Price</p>
              <p class="text-lg font-semibold">{formatCurrency(sale.sale_price)}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Sale Date</p>
              <p class="text-sm">{formatDate(sale.created_at)}</p>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Payment Details -->
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <Card.Title>Payment Details</Card.Title>
              <Button variant="ghost" size="icon" onclick={onEdit}>
                <IconEdit class="size-4" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Payment Status</p>
              <Badge variant={getPaymentStatusVariant(sale.payment_status)}>
                {sale.payment_status === "paid" ? "Paid" : sale.payment_status === "overdue" ? "Overdue" : "Pending"}
              </Badge>
            </div>
            {#if sale.payment_status === "paid"}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p class="text-sm capitalize">{sale.payment_method || "N/A"}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Payment Reference</p>
                <p class="text-sm">{sale.payment_reference || "N/A"}</p>
              </div>
              {#if sale.payment_received_at}
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Payment Received</p>
                  <p class="text-sm">{formatDate(sale.payment_received_at)}</p>
                </div>
              {/if}
            {/if}
          </Card.Content>
        </Card.Root>

        <!-- Shipping Details -->
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <Card.Title>Shipping Details</Card.Title>
              <Button variant="ghost" size="icon" onclick={onEdit}>
                <IconEdit class="size-4" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Shipping Status</p>
              <Badge variant={getShippingStatusVariant(sale.shipping_status)}>
                {sale.shipping_status === "delivered" ? "Delivered" : sale.shipping_status === "shipped" ? "Shipped" : "Pending"}
              </Badge>
            </div>
            {#if sale.tracking_number}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Tracking Number</p>
                <p class="text-sm font-mono">{sale.tracking_number}</p>
              </div>
            {/if}
            {#if sale.shipped_at}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Shipped Date</p>
                <p class="text-sm">{formatDate(sale.shipped_at)}</p>
              </div>
            {/if}
            {#if sale.delivered_at}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Delivered Date</p>
                <p class="text-sm">{formatDate(sale.delivered_at)}</p>
              </div>
            {/if}
            <div>
              <p class="text-sm font-medium text-muted-foreground">Shipping Address</p>
              <p class="text-sm">{getFullShippingAddress(sale)}</p>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Notes -->
        {#if sale.admin_notes || sale.customer_notes}
          <Card.Root>
            <Card.Header>
              <Card.Title>Notes</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-3">
              {#if sale.admin_notes}
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Admin Notes</p>
                  <p class="text-sm whitespace-pre-wrap">{sale.admin_notes}</p>
                </div>
              {/if}
              {#if sale.customer_notes}
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Customer Notes</p>
                  <p class="text-sm whitespace-pre-wrap">{sale.customer_notes}</p>
                </div>
              {/if}
            </Card.Content>
          </Card.Root>
        {/if}
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-end">
      <Button variant="outline" onclick={() => {
        open = false;
        onCancel?.();
      }}>
        Close
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

