<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SalesRecord } from "$lib/types/sales-record";
  import { formatCurrency } from "$lib/utils";

  interface Props {
    open?: boolean;
    sale: SalesRecord | null;
    onConfirm: (data: {
      tracking_number: string;
      carrier: string;
      shipped_at: string;
      admin_notes?: string;
    }) => Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    sale,
    onConfirm,
    onCancel,
  }: Props = $props();

  let trackingNumber = $state("");
  let carrier = $state("ups");
  let shippedDate = $state(new Date().toISOString().split("T")[0]);
  let adminNotes = $state("");
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};
    if (!trackingNumber.trim()) {
      errors.trackingNumber = "Tracking number is required";
      return false;
    }
    if (!carrier) {
      errors.carrier = "Carrier is required";
      return false;
    }
    if (!shippedDate) {
      errors.shippedDate = "Shipped date is required";
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onConfirm({
        tracking_number: trackingNumber.trim(),
        carrier: carrier,
        shipped_at: new Date(shippedDate).toISOString(),
        admin_notes: adminNotes.trim() || undefined,
      });
      reset();
      open = false;
    } catch (error: any) {
      errors.submit = error.message || "Failed to mark as shipped";
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    reset();
    open = false;
    onCancel?.();
  }

  function reset() {
    trackingNumber = "";
    carrier = "ups";
    shippedDate = new Date().toISOString().split("T")[0];
    adminNotes = "";
    errors = {};
  }

  $effect(() => {
    if (!open) {
      reset();
    }
  });
</script>

<Drawer.Root bind:open>
  <Drawer.Content class="sm:max-w-md">
    <Drawer.Header>
      <Drawer.Title>Mark as Shipped</Drawer.Title>
      <Drawer.Description>
        Record shipping details for this sale
      </Drawer.Description>
    </Drawer.Header>

    {#if sale}
      <div class="space-y-4 px-4">
        <!-- Sale Details -->
        <div class="rounded-lg border p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-muted-foreground">Lot:</span>
            <span class="text-sm font-medium">{sale.lot_title}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm font-medium text-muted-foreground">Buyer:</span>
            <span class="text-sm">{sale.user_name || sale.user_email}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm font-medium text-muted-foreground">Amount:</span>
            <span class="text-sm font-semibold">{formatCurrency(sale.sale_price)}</span>
          </div>
        </div>

        <Field>
          <FieldContent>
            <FieldLabel for="trackingNumber">Tracking Number *</FieldLabel>
            <Input
              id="trackingNumber"
              bind:value={trackingNumber}
              placeholder="Enter tracking number"
              required
              aria-invalid={errors.trackingNumber ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.trackingNumber}
            <FieldError errors={[{ message: errors.trackingNumber }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="carrier">Carrier *</FieldLabel>
            <Select.Root bind:selected={carrier} onSelectedChange={(v) => {
              carrier = v?.value || "ups";
            }}>
              <Select.Trigger>
                <Select.Value placeholder="Select carrier" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="ups">UPS</Select.Item>
                <Select.Item value="fedex">FedEx</Select.Item>
                <Select.Item value="usps">USPS</Select.Item>
                <Select.Item value="dhl">DHL</Select.Item>
                <Select.Item value="other">Other</Select.Item>
              </Select.Content>
            </Select.Root>
          </FieldContent>
          {#if errors.carrier}
            <FieldError errors={[{ message: errors.carrier }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="shippedDate">Shipped Date *</FieldLabel>
            <Input
              id="shippedDate"
              type="date"
              bind:value={shippedDate}
              required
              aria-invalid={errors.shippedDate ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.shippedDate}
            <FieldError errors={[{ message: errors.shippedDate }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="adminNotes">Admin Notes (Optional)</FieldLabel>
            <textarea
              id="adminNotes"
              bind:value={adminNotes}
              placeholder="Add any additional notes about this shipment..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FieldContent>
        </Field>

        {#if errors.submit}
          <div class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {errors.submit}
          </div>
        {/if}
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-end gap-2">
      <Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button onclick={handleConfirm} disabled={isSubmitting || !sale}>
        {isSubmitting ? "Saving..." : "Mark as Shipped"}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

