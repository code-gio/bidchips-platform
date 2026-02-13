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

<div class="w-full max-w-7xl border border-background-muted/10 shadow-lg rounded-xl px-24 py-10">
  <div class="mb-4 px-4">
    <h1 class="text-5xl font-normal tracking-tight text-foreground">{title}</h1>
    <p class="text-muted-foreground mt-2">{subtitle}</p>
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
