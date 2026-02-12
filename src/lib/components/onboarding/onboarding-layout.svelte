<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    subtitle,
    formData = {},
    step,
    onBack,
    formSlot,
    previewSlot,
  }: {
    title: string;
    subtitle: string;
    formData?: Record<string, unknown>;
    step?: number;
    onBack?: () => void;
    formSlot: Snippet;
    previewSlot: Snippet<[Record<string, unknown>]>;
  } = $props();
</script>

<div class="w-full max-w-6xl">
  <div class="mb-8">
    <h1 class="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
    <p class="text-muted-foreground">{subtitle}</p>
  </div>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
    <div class="flex max-h-[calc(100dvh-12rem)] flex-col overflow-y-auto px-4">
      {@render formSlot()}
    </div>
    <div class="flex flex-col">
      <div class="sticky top-4">
        {@render previewSlot(formData)}
      </div>
    </div>
  </div>
</div>
