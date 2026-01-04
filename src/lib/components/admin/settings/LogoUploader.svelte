<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { IconUpload, IconTrash } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    currentLogoUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    onRemove: () => Promise<void>;
  }

  let {
    currentLogoUrl,
    onUpload,
    onRemove,
  }: Props = $props();

  let isUploading = $state(false);
  let isRemoving = $state(false);
  let fileInput: HTMLInputElement | null = $state(null);

  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, or SVG");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    isUploading = true;
    try {
      await onUpload(file);
      toast.success("Logo uploaded successfully");
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      isUploading = false;
    }
  }

  async function handleRemove() {
    isRemoving = true;
    try {
      await onRemove();
      toast.success("Logo removed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove logo");
    } finally {
      isRemoving = false;
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Logo</Card.Title>
    <Card.Description>
      Upload your site logo. Max size: 2MB. Supported formats: PNG, JPG, SVG
    </Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4">
    {#if currentLogoUrl}
      <div class="flex items-center gap-4">
        <Avatar.Root class="size-24 rounded-md border">
          <Avatar.Image src={currentLogoUrl} alt="Current logo" />
        </Avatar.Root>
        <div class="flex-1">
          <p class="text-sm font-medium">Current Logo</p>
          <p class="text-xs text-muted-foreground">Click upload to replace</p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onclick={handleRemove}
          disabled={isRemoving}
        >
          <IconTrash class="size-4" />
        </Button>
      </div>
    {:else}
      <div class="flex h-24 items-center justify-center rounded-lg border border-dashed">
        <p class="text-sm text-muted-foreground">No logo uploaded</p>
      </div>
    {/if}

    <div class="flex gap-2">
      <input
        bind:this={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onchange={handleFileSelect}
        class="hidden"
        id="logo-upload"
      />
      <Button
        variant="outline"
        onclick={() => fileInput?.click()}
        disabled={isUploading}
      >
        <IconUpload class="size-4" />
        {isUploading ? "Uploading..." : "Upload Logo"}
      </Button>
    </div>
  </Card.Content>
</Card.Root>

