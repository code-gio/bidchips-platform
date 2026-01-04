<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { User } from "$lib/types/user";

  interface Props {
    open?: boolean;
    user: User | null;
    onConfirm: (reason: string) => Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    user,
    onConfirm,
    onCancel,
  }: Props = $props();

  let reason = $state("");
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};
    if (!reason.trim()) {
      errors.reason = "Ban reason is required";
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onConfirm(reason.trim());
      reset();
      open = false;
    } catch (error: any) {
      errors.submit = error.message || "Failed to ban user";
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
    reason = "";
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
      <Drawer.Title>Ban User</Drawer.Title>
      <Drawer.Description>
        {#if user}
          Are you sure you want to ban <strong>{user.display_name || user.email}</strong>? This action can be reversed later.
        {/if}
      </Drawer.Description>
    </Drawer.Header>

    <div class="space-y-4 px-4">
      <Field>
        <FieldContent>
          <FieldLabel for="reason">Ban Reason *</FieldLabel>
          <textarea
            id="reason"
            bind:value={reason}
            placeholder="Enter the reason for banning this user..."
            rows="4"
            required
            class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={errors.reason ? "true" : undefined}
          />
        </FieldContent>
        {#if errors.reason}
          <FieldError errors={[{ message: errors.reason }]} />
        {/if}
      </Field>

      {#if errors.submit}
        <div class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      {/if}
    </div>

    <Drawer.Footer class="flex-row justify-end gap-2">
      <Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="destructive" onclick={handleConfirm} disabled={isSubmitting || !user}>
        {isSubmitting ? "Banning..." : "Ban User"}
      </Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

