<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Field, FieldContent, FieldLabel } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { toast } from "svelte-sonner";

  interface Props {
    currentColor: string;
    onSave: (color: string) => Promise<void>;
  }

  let { currentColor, onSave }: Props = $props();

  let color = $state(currentColor);
  let isSaving = $state(false);

  const presetColors = [
    "#000000",
    "#1a1a1a",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  $effect(() => {
    color = currentColor;
  });

  async function handleSave() {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      toast.error("Invalid color format. Please use hex format (e.g., #3b82f6)");
      return;
    }
    isSaving = true;
    try {
      await onSave(color);
      toast.success("Primary color updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save color");
    } finally {
      isSaving = false;
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Primary Color</Card.Title>
    <Card.Description>
      Set your site's primary brand color
    </Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="flex items-center gap-4">
      <div
        class="size-16 rounded-md border-2 border-border"
        style="background-color: {color}"
      />
      <div class="flex-1">
        <Field>
          <FieldContent>
            <FieldLabel for="color">Color (Hex)</FieldLabel>
            <div class="flex gap-2">
              <Input
                id="color"
                type="text"
                bind:value={color}
                placeholder="#3b82f6"
                class="font-mono"
                maxlength="7"
              />
              <Input
                type="color"
                bind:value={color}
                class="h-9 w-20"
              />
            </div>
          </FieldContent>
        </Field>
      </div>
    </div>

    <div>
      <p class="text-sm font-medium mb-2">Preset Colors</p>
      <div class="flex flex-wrap gap-2">
        {#each presetColors as preset}
          <button
            type="button"
            class="size-8 rounded-md border-2 transition-all hover:scale-110"
            class:border-primary={color === preset}
            style="background-color: {preset}"
            onclick={() => {
              color = preset;
            }}
            aria-label="Select color {preset}"
          />
        {/each}
      </div>
    </div>

    <div class="flex justify-end">
      <Button onclick={handleSave} disabled={isSaving || color === currentColor}>
        {isSaving ? "Saving..." : "Save Color"}
      </Button>
    </div>
  </Card.Content>
</Card.Root>

