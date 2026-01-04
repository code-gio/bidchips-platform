<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Offer } from "$lib/types/offer";

  interface Props {
    open?: boolean;
    offer: Offer | null;
    onConfirm: (counterAmount: number, adminMessage: string) => Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    offer,
    onConfirm,
    onCancel,
  }: Props = $props();

  let counterAmount = $state("");
  let adminMessage = $state("");
  let isSubmitting = $state(false);
  let error = $state("");

  async function handleConfirm() {
    if (!offer) return;
    
    if (!counterAmount || parseFloat(counterAmount) <= 0) {
      error = "Counter amount must be greater than 0";
      return;
    }

    if (parseFloat(counterAmount) <= offer.amount) {
      error = "Counter amount must be higher than the original offer";
      return;
    }

    if (!adminMessage.trim()) {
      error = "Admin message is required";
      return;
    }

    isSubmitting = true;
    error = "";
    try {
      await onConfirm(parseFloat(counterAmount), adminMessage);
      counterAmount = "";
      adminMessage = "";
      open = false;
    } catch (err: any) {
      error = err.message || "Failed to send counter offer";
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    counterAmount = "";
    adminMessage = "";
    error = "";
    open = false;
    onCancel?.();
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
</script>

<Drawer.Root bind:open>
  <Drawer.Content class="sm:max-w-md">
    <Drawer.Header>
      <Drawer.Title>Counter Offer</Drawer.Title>
      <Drawer.Description>
        Send a counter offer to the buyer with a new amount.
      </Drawer.Description>
    </Drawer.Header>

    {#if offer}
      <div class="space-y-4 px-4">
        <div class="rounded-lg border p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Original Offer:</span>
            <span class="font-medium">{formatCurrency(offer.amount)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">User:</span>
            <span class="font-medium">{offer.user_name || "Unknown"}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Lot:</span>
            <span class="font-medium">{offer.lot_title || "N/A"}</span>
          </div>
        </div>

        <Field>
          <FieldContent>
            <FieldLabel for="counterAmount">Counter Amount *</FieldLabel>
            <Input
              id="counterAmount"
              type="number"
              step="0.01"
              bind:value={counterAmount}
              placeholder="Enter counter offer amount"
              required
              aria-invalid={error ? "true" : undefined}
            />
            <p class="text-xs text-muted-foreground mt-1">
              Must be higher than {formatCurrency(offer.amount)}
            </p>
          </FieldContent>
          {#if error}
            <FieldError errors={[{ message: error }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="adminMessage">Message to Buyer *</FieldLabel>
            <textarea
              id="adminMessage"
              bind:value={adminMessage}
              placeholder="Explain the counter offer..."
              required
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FieldContent>
        </Field>
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-end gap-2">
      <Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button onclick={handleConfirm} disabled={isSubmitting || !offer}>
        {isSubmitting ? "Sending..." : "Send Counter Offer"}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

