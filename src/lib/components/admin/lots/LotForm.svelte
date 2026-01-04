<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Lot } from "$lib/types/lot";
  import type { Category } from "$lib/types/category";
  import { Separator } from "$lib/components/ui/separator/index.js";

  interface Props {
    lot?: Partial<Lot>;
    categories?: Category[];
    onSave?: (data: Partial<Lot>, status: "draft" | "scheduled") => Promise<void>;
    isLoading?: boolean;
  }

  let {
    lot: initialLot,
    categories: initialCategories = [],
    onSave,
    isLoading = false,
  }: Props = $props();

  let categories = $state<Category[]>(initialCategories);

  // Form state
  let title = $state(initialLot?.title || "");
  let description = $state(initialLot?.description || "");
  let mpn = $state(initialLot?.mpn || "");
  let manufacturer = $state(initialLot?.manufacturer || "");
  let categoryId = $state(initialLot?.category_id || "");
  let condition = $state<Lot["condition"]>(initialLot?.condition || "new");
  let quantity = $state(initialLot?.quantity?.toString() || "1");
  let startingPrice = $state(initialLot?.starting_price?.toString() || "");
  let reservePrice = $state(initialLot?.reserve_price?.toString() || "");
  let bidIncrement = $state(initialLot?.bid_increment?.toString() || "1");
  let minimumOffer = $state(initialLot?.minimum_offer?.toString() || "");
  let startTime = $state(
    initialLot?.start_time
      ? new Date(initialLot.start_time).toISOString().slice(0, 16)
      : ""
  );
  let endTime = $state(
    initialLot?.end_time
      ? new Date(initialLot.end_time).toISOString().slice(0, 16)
      : ""
  );
  let allowOffers = $state(initialLot?.allow_offers ?? false);
  let hideBidHistory = $state(initialLot?.hide_bid_history ?? false);
  let hideTimeRemaining = $state(initialLot?.hide_time_remaining ?? false);
  let featuredLot = $state(initialLot?.featured_lot ?? false);
  let keywords = $state(initialLot?.keywords?.join(", ") || "");

  // Errors
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!description.trim()) errors.description = "Description is required";
    if (!categoryId) errors.categoryId = "Category is required";
    if (!condition) errors.condition = "Condition is required";
    if (!quantity || parseInt(quantity) < 1) errors.quantity = "Quantity must be at least 1";
    if (!startingPrice || parseFloat(startingPrice) <= 0)
      errors.startingPrice = "Starting price must be greater than 0";
    if (!reservePrice || parseFloat(reservePrice) <= 0)
      errors.reservePrice = "Reserve price must be greater than 0";
    if (!bidIncrement || parseFloat(bidIncrement) <= 0)
      errors.bidIncrement = "Bid increment must be greater than 0";
    if (!startTime) errors.startTime = "Start time is required";
    if (!endTime) errors.endTime = "End time is required";
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      errors.endTime = "End time must be after start time";
    }
    return Object.keys(errors).length === 0;
  }

  function getDuration(): string {
    if (!startTime || !endTime) return "";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  async function handleSave(status: "draft" | "scheduled") {
    if (!validate()) return;
    if (!onSave) return;

    const formData: Partial<Lot> = {
      title: title.trim(),
      description: description.trim(),
      mpn: mpn.trim() || null,
      manufacturer: manufacturer.trim() || null,
      category_id: categoryId || null,
      condition,
      quantity: parseInt(quantity),
      starting_price: parseFloat(startingPrice),
      reserve_price: parseFloat(reservePrice),
      bid_increment: parseFloat(bidIncrement),
      minimum_offer: minimumOffer ? parseFloat(minimumOffer) : null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      original_end_time: new Date(endTime).toISOString(),
      allow_offers: allowOffers,
      hide_bid_history: hideBidHistory,
      hide_time_remaining: hideTimeRemaining,
      featured_lot: featuredLot,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      status,
    };

    await onSave(formData, status);
  }

  onMount(async () => {
    if (categories.length === 0) {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            categories = data.data || [];
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
  });
</script>

<div class="space-y-6">
  <!-- Basic Info Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Basic Information</Card.Title>
      <Card.Description>Enter the basic details about the lot</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <Field>
        <FieldContent>
          <FieldLabel for="title">Title *</FieldLabel>
          <Input
            id="title"
            bind:value={title}
            placeholder="Enter lot title"
            required
            aria-invalid={errors.title ? "true" : undefined}
          />
        </FieldContent>
        {#if errors.title}
          <FieldError errors={[{ message: errors.title }]} />
        {/if}
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel for="description">Description *</FieldLabel>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Enter detailed description"
            required
            rows="4"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={errors.description ? "true" : undefined}
          />
        </FieldContent>
        {#if errors.description}
          <FieldError errors={[{ message: errors.description }]} />
        {/if}
      </Field>

      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel for="mpn">MPN</FieldLabel>
            <Input
              id="mpn"
              bind:value={mpn}
              placeholder="Manufacturer Part Number"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="manufacturer">Manufacturer</FieldLabel>
            <Input
              id="manufacturer"
              bind:value={manufacturer}
              placeholder="Manufacturer name"
            />
          </FieldContent>
        </Field>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel for="category">Category *</FieldLabel>
            <Select.Root bind:selected={categoryId} onSelectedChange={(v) => {
              categoryId = v?.value || "";
            }}>
              <Select.Trigger>
                <Select.Value placeholder="Select category" />
              </Select.Trigger>
              <Select.Content>
                {#each categories as cat}
                  <Select.Item value={cat.id}>{cat.name}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </FieldContent>
          {#if errors.categoryId}
            <FieldError errors={[{ message: errors.categoryId }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="condition">Condition *</FieldLabel>
            <Select.Root bind:selected={condition} onSelectedChange={(v) => {
              condition = (v?.value as Lot["condition"]) || "new";
            }}>
              <Select.Trigger>
                <Select.Value placeholder="Select condition" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="new">New</Select.Item>
                <Select.Item value="used">Used</Select.Item>
                <Select.Item value="refurbished">Refurbished</Select.Item>
                <Select.Item value="for-parts">For Parts</Select.Item>
              </Select.Content>
            </Select.Root>
          </FieldContent>
          {#if errors.condition}
            <FieldError errors={[{ message: errors.condition }]} />
          {/if}
        </Field>
      </div>

      <Field>
        <FieldContent>
          <FieldLabel for="quantity">Quantity *</FieldLabel>
          <Input
            id="quantity"
            type="number"
            bind:value={quantity}
            min="1"
            required
            aria-invalid={errors.quantity ? "true" : undefined}
          />
        </FieldContent>
        {#if errors.quantity}
          <FieldError errors={[{ message: errors.quantity }]} />
        {/if}
      </Field>
    </Card.Content>
  </Card.Root>

  <!-- Pricing Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Pricing</Card.Title>
      <Card.Description>Set the auction pricing details</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel for="startingPrice">Starting Price *</FieldLabel>
            <Input
              id="startingPrice"
              type="number"
              step="0.01"
              bind:value={startingPrice}
              placeholder="0.00"
              required
              aria-invalid={errors.startingPrice ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.startingPrice}
            <FieldError errors={[{ message: errors.startingPrice }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="reservePrice">Reserve Price *</FieldLabel>
            <Input
              id="reservePrice"
              type="number"
              step="0.01"
              bind:value={reservePrice}
              placeholder="0.00"
              required
              aria-invalid={errors.reservePrice ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.reservePrice}
            <FieldError errors={[{ message: errors.reservePrice }]} />
          {/if}
        </Field>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel for="bidIncrement">Bid Increment *</FieldLabel>
            <Input
              id="bidIncrement"
              type="number"
              step="0.01"
              bind:value={bidIncrement}
              placeholder="1.00"
              required
              aria-invalid={errors.bidIncrement ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.bidIncrement}
            <FieldError errors={[{ message: errors.bidIncrement }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="minimumOffer">Minimum Offer (Optional)</FieldLabel>
            <Input
              id="minimumOffer"
              type="number"
              step="0.01"
              bind:value={minimumOffer}
              placeholder="0.00"
              disabled={!allowOffers}
            />
          </FieldContent>
        </Field>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Timing Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Timing</Card.Title>
      <Card.Description>Set when the auction starts and ends</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel for="startTime">Start Time *</FieldLabel>
            <Input
              id="startTime"
              type="datetime-local"
              bind:value={startTime}
              required
              aria-invalid={errors.startTime ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.startTime}
            <FieldError errors={[{ message: errors.startTime }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="endTime">End Time *</FieldLabel>
            <Input
              id="endTime"
              type="datetime-local"
              bind:value={endTime}
              required
              aria-invalid={errors.endTime ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.endTime}
            <FieldError errors={[{ message: errors.endTime }]} />
          {/if}
        </Field>
      </div>

      {#if startTime && endTime && getDuration()}
        <div class="rounded-lg bg-muted p-3 text-sm">
          <strong>Duration:</strong> {getDuration()}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Settings Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Settings</Card.Title>
      <Card.Description>Configure lot display and behavior options</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <FieldLabel>Allow Offers</FieldLabel>
            <p class="text-sm text-muted-foreground">
              Allow users to submit offers for this lot
            </p>
          </div>
          <Checkbox.Root bind:checked={allowOffers} />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <FieldLabel>Hide Bid History</FieldLabel>
            <p class="text-sm text-muted-foreground">
              Hide the bid history from public view
            </p>
          </div>
          <Checkbox.Root bind:checked={hideBidHistory} />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <FieldLabel>Hide Time Remaining</FieldLabel>
            <p class="text-sm text-muted-foreground">
              Hide the countdown timer from public view
            </p>
          </div>
          <Checkbox.Root bind:checked={hideTimeRemaining} />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <FieldLabel>Featured Lot</FieldLabel>
            <p class="text-sm text-muted-foreground">
              Feature this lot on the homepage
            </p>
          </div>
          <Checkbox.Root bind:checked={featuredLot} />
        </div>
      </div>

      <Separator />

      <Field>
        <FieldContent>
          <FieldLabel for="keywords">Keywords</FieldLabel>
          <Input
            id="keywords"
            bind:value={keywords}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p class="text-sm text-muted-foreground mt-1">
            Separate keywords with commas
          </p>
        </FieldContent>
      </Field>
    </Card.Content>
  </Card.Root>

  <!-- Action Buttons -->
  <div class="flex justify-end gap-3">
    <Button variant="outline" href="/admin/lots" disabled={isLoading}>
      Cancel
    </Button>
    <Button
      variant="outline"
      onclick={() => handleSave("draft")}
      disabled={isLoading}
    >
      Save as Draft
    </Button>
    <Button
      onclick={() => handleSave("scheduled")}
      disabled={isLoading}
    >
      {isLoading ? "Saving..." : "Publish"}
    </Button>
  </div>
</div>

