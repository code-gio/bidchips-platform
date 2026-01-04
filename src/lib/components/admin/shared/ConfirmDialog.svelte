<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  interface Props {
    open?: boolean;
    title: string;
    description: string;
    variant?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    title,
    description,
    variant = "info",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
  }: Props = $props();

  let isConfirming = $state(false);

  async function handleConfirm() {
    isConfirming = true;
    try {
      await onConfirm();
      open = false;
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      isConfirming = false;
    }
  }

  function handleCancel() {
    open = false;
    onCancel?.();
  }

  let confirmVariant = $derived(variant === "danger" ? "destructive" : "default");
</script>

<Drawer.Root bind:open>
  <Drawer.Content class="sm:max-w-md">
    <Drawer.Header>
      <Drawer.Title>{title}</Drawer.Title>
      <Drawer.Description>{description}</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer class="flex-row justify-end gap-2">
      <Button
        variant="outline"
        onclick={handleCancel}
        disabled={isConfirming || loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onclick={handleConfirm}
        disabled={isConfirming || loading}
      >
        {#if isConfirming || loading}
          <span class="animate-spin">⏳</span>
        {/if}
        {confirmText}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

