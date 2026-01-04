<script lang="ts">
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SiteSettings } from "$lib/types/settings";
  import { toast } from "svelte-sonner";

  interface Props {
    settings: SiteSettings | null;
    onSave: (data: Partial<SiteSettings>) => Promise<void>;
  }

  let { settings, onSave }: Props = $props();

  let defaultBidIncrement = $state(0);
  let minimumBidIncrement = $state(0);
  let extensionTime = $state(0);
  let extensionWindow = $state(0);
  let allowOffers = $state(false);
  let requireEmailVerification = $state(false);
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  // Populate form when settings change
  $effect(() => {
    if (settings) {
      defaultBidIncrement = settings.default_bid_increment || 0;
      minimumBidIncrement = settings.minimum_bid_increment || 0;
      extensionTime = settings.extension_time || 0;
      extensionWindow = settings.extension_window || 0;
      allowOffers = settings.allow_offers || false;
      requireEmailVerification = settings.require_email_verification || false;
      errors = {};
    }
  });

  function validate(): boolean {
    errors = {};
    if (defaultBidIncrement < 0) errors.defaultBidIncrement = "Must be 0 or greater";
    if (minimumBidIncrement < 0) errors.minimumBidIncrement = "Must be 0 or greater";
    if (extensionTime < 0) errors.extensionTime = "Must be 0 or greater";
    if (extensionWindow < 0) errors.extensionWindow = "Must be 0 or greater";
    if (minimumBidIncrement > defaultBidIncrement && defaultBidIncrement > 0) {
      errors.minimumBidIncrement = "Minimum cannot be greater than default";
    }
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onSave({
        default_bid_increment: defaultBidIncrement,
        minimum_bid_increment: minimumBidIncrement,
        extension_time: extensionTime,
        extension_window: extensionWindow,
        allow_offers: allowOffers,
        require_email_verification: requireEmailVerification,
      });
      toast.success("Auction settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Bid Increments</h2>
    <p class="text-sm text-muted-foreground">Configure default and minimum bid increments</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="defaultBidIncrement">Default Bid Increment ($)</FieldLabel>
        <Input
          id="defaultBidIncrement"
          type="number"
          bind:value={defaultBidIncrement}
          min="0"
          step="0.01"
          placeholder="10.00"
          aria-invalid={errors.defaultBidIncrement ? "true" : undefined}
        />
      </FieldContent>
      {#if errors.defaultBidIncrement}
        <FieldError errors={[{ message: errors.defaultBidIncrement }]} />
      {/if}
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="minimumBidIncrement">Minimum Bid Increment ($)</FieldLabel>
        <Input
          id="minimumBidIncrement"
          type="number"
          bind:value={minimumBidIncrement}
          min="0"
          step="0.01"
          placeholder="1.00"
          aria-invalid={errors.minimumBidIncrement ? "true" : undefined}
        />
      </FieldContent>
      {#if errors.minimumBidIncrement}
        <FieldError errors={[{ message: errors.minimumBidIncrement }]} />
      {/if}
    </Field>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Auction Extensions</h2>
    <p class="text-sm text-muted-foreground">Configure automatic auction extension settings</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="extensionTime">Extension Time (minutes)</FieldLabel>
        <Input
          id="extensionTime"
          type="number"
          bind:value={extensionTime}
          min="0"
          placeholder="5"
          aria-invalid={errors.extensionTime ? "true" : undefined}
        />
        <p class="text-xs text-muted-foreground mt-1">
          How long to extend the auction when a bid is placed near the end
        </p>
      </FieldContent>
      {#if errors.extensionTime}
        <FieldError errors={[{ message: errors.extensionTime }]} />
      {/if}
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="extensionWindow">Extension Window (minutes)</FieldLabel>
        <Input
          id="extensionWindow"
          type="number"
          bind:value={extensionWindow}
          min="0"
          placeholder="2"
          aria-invalid={errors.extensionWindow ? "true" : undefined}
        />
        <p class="text-xs text-muted-foreground mt-1">
          How close to the end time a bid must be placed to trigger an extension
        </p>
      </FieldContent>
      {#if errors.extensionWindow}
        <FieldError errors={[{ message: errors.extensionWindow }]} />
      {/if}
    </Field>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Features</h2>
    <p class="text-sm text-muted-foreground">Enable or disable platform features</p>
  </div>

  <div class="space-y-4">
    <div class="flex items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FieldLabel>Allow Offers</FieldLabel>
        <p class="text-sm text-muted-foreground">
          Allow users to submit offers on auction lots
        </p>
      </div>
      <Checkbox.Root bind:checked={allowOffers} />
    </div>

    <div class="flex items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FieldLabel>Require Email Verification</FieldLabel>
        <p class="text-sm text-muted-foreground">
          Require users to verify their email before bidding
        </p>
      </div>
      <Checkbox.Root bind:checked={requireEmailVerification} />
    </div>
  </div>

  <div class="flex justify-end">
    <Button onclick={handleSave} disabled={isSubmitting || !settings}>
      {isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  </div>
</div>

