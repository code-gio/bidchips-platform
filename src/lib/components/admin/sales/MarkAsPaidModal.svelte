<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SalesRecord } from "$lib/types/sales-record";
  import { formatCurrency, formatDate } from "$lib/utils";

  interface Props {
    open?: boolean;
    sale: SalesRecord | null;
    onConfirm: (data: {
      payment_method: string;
      payment_reference: string;
      payment_received_at: string;
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

  let paymentMethod = $state("wire");
  let paymentReference = $state("");
  let paymentDate = $state(new Date().toISOString().split("T")[0]);
  let adminNotes = $state("");
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};
    if (!paymentMethod) {
      errors.paymentMethod = "Payment method is required";
      return false;
    }
    if (!paymentReference.trim()) {
      errors.paymentReference = "Payment reference is required";
      return false;
    }
    if (!paymentDate) {
      errors.paymentDate = "Payment date is required";
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onConfirm({
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        payment_received_at: new Date(paymentDate).toISOString(),
        admin_notes: adminNotes.trim() || undefined,
      });
      reset();
      open = false;
    } catch (error: any) {
      errors.submit = error.message || "Failed to mark as paid";
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
    paymentMethod = "wire";
    paymentReference = "";
    paymentDate = new Date().toISOString().split("T")[0];
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
      <Drawer.Title>Mark as Paid</Drawer.Title>
      <Drawer.Description>
        Record payment details for this sale
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
            <FieldLabel for="paymentMethod">Payment Method *</FieldLabel>
            <Select.Root bind:selected={paymentMethod} onSelectedChange={(v) => {
              paymentMethod = v?.value || "wire";
            }}>
              <Select.Trigger>
                <Select.Value placeholder="Select payment method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="wire">Wire Transfer</Select.Item>
                <Select.Item value="check">Check</Select.Item>
                <Select.Item value="cash">Cash</Select.Item>
                <Select.Item value="credit_card">Credit Card</Select.Item>
                <Select.Item value="other">Other</Select.Item>
              </Select.Content>
            </Select.Root>
          </FieldContent>
          {#if errors.paymentMethod}
            <FieldError errors={[{ message: errors.paymentMethod }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="paymentReference">
              Payment Reference *
              <span class="text-xs text-muted-foreground ml-1">
                ({paymentMethod === "wire" ? "Wire confirmation #" : paymentMethod === "check" ? "Check #" : "Reference"})
              </span>
            </FieldLabel>
            <Input
              id="paymentReference"
              bind:value={paymentReference}
              placeholder={paymentMethod === "wire" ? "Wire confirmation number" : paymentMethod === "check" ? "Check number" : "Payment reference"}
              required
              aria-invalid={errors.paymentReference ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.paymentReference}
            <FieldError errors={[{ message: errors.paymentReference }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="paymentDate">Payment Received Date *</FieldLabel>
            <Input
              id="paymentDate"
              type="date"
              bind:value={paymentDate}
              required
              aria-invalid={errors.paymentDate ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.paymentDate}
            <FieldError errors={[{ message: errors.paymentDate }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="adminNotes">Admin Notes (Optional)</FieldLabel>
            <textarea
              id="adminNotes"
              bind:value={adminNotes}
              placeholder="Add any additional notes about this payment..."
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
        {isSubmitting ? "Saving..." : "Mark as Paid"}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

