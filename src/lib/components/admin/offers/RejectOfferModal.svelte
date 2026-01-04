<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Offer } from "$lib/types/offer";

  interface Props {
    open?: boolean;
    offer: Offer | null;
    onConfirm: (adminResponse: string) => Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    offer,
    onConfirm,
    onCancel,
  }: Props = $props();

  let adminResponse = $state("");
  let isSubmitting = $state(false);
  let error = $state("");

  async function handleConfirm() {
    if (!offer) return;
    
    if (!adminResponse.trim()) {
      error = "Admin response is required";
      return;
    }

    isSubmitting = true;
    error = "";
    try {
      await onConfirm(adminResponse);
      adminResponse = "";
      open = false;
    } catch (err: any) {
      error = err.message || "Failed to reject offer";
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    adminResponse = "";
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
      <Drawer.Title>Reject Offer</Drawer.Title>
      <Drawer.Description>
        Reject this offer. You must provide a reason for rejection.
      </Drawer.Description>
    </Drawer.Header>

    {#if offer}
      <div class="space-y-4 px-4">
        <div class="rounded-lg border p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">User:</span>
            <span class="font-medium">{offer.user_name || "Unknown"}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Lot:</span>
            <span class="font-medium">{offer.lot_title || "N/A"}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Offer Amount:</span>
            <span class="font-medium">{formatCurrency(offer.amount)}</span>
          </div>
        </div>

        <Field>
          <FieldContent>
            <FieldLabel for="adminResponse">Rejection Reason *</FieldLabel>
            <textarea
              id="adminResponse"
              bind:value={adminResponse}
              placeholder="Explain why this offer is being rejected..."
              required
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={error ? "true" : undefined}
            />
          </FieldContent>
          {#if error}
            <FieldError errors={[{ message: error }]} />
          {/if}
        </Field>
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-end gap-2">
      <Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onclick={handleConfirm}
        disabled={isSubmitting || !offer}
      >
        {isSubmitting ? "Rejecting..." : "Reject Offer"}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

