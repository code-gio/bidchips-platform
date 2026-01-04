<script lang="ts">
  import { Field, FieldContent, FieldLabel } from "$lib/components/ui/field/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SiteSettings } from "$lib/types/settings";
  import { toast } from "svelte-sonner";

  interface Props {
    settings: SiteSettings | null;
    onSave: (data: Partial<SiteSettings>) => Promise<void>;
  }

  let { settings, onSave }: Props = $props();

  let sendEmailNotifications = $state(false);
  let emailProvider = $state<string>("");
  let isSubmitting = $state(false);
  let isTesting = $state(false);

  // Populate form when settings change
  $effect(() => {
    if (settings) {
      sendEmailNotifications = settings.send_email_notifications || false;
      emailProvider = settings.email_provider || "";
    }
  });

  async function handleSave() {
    isSubmitting = true;
    try {
      await onSave({
        send_email_notifications: sendEmailNotifications,
        email_provider: emailProvider || null,
      });
      toast.success("Email settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleTestEmail() {
    isTesting = true;
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Test email sent successfully");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to send test email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send test email");
    } finally {
      isTesting = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Email Notifications</h2>
    <p class="text-sm text-muted-foreground">Configure email notification settings</p>
  </div>

  <div class="space-y-4">
    <div class="flex items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FieldLabel>Send Email Notifications</FieldLabel>
        <p class="text-sm text-muted-foreground">
          Enable email notifications for users (outbid, won, ending soon, etc.)
        </p>
      </div>
      <Checkbox.Root bind:checked={sendEmailNotifications} />
    </div>

    {#if sendEmailNotifications}
      <Field>
        <FieldContent>
          <FieldLabel for="emailProvider">Email Provider</FieldLabel>
          <Select.Root bind:selected={emailProvider} onSelectedChange={(v) => {
            emailProvider = v?.value || "";
          }}>
            <Select.Trigger>
              <Select.Value placeholder="Select email provider" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="sendgrid">SendGrid</Select.Item>
              <Select.Item value="mailgun">Mailgun</Select.Item>
              <Select.Item value="resend">Resend</Select.Item>
            </Select.Content>
          </Select.Root>
          <p class="text-xs text-muted-foreground mt-1">
            Configure your email provider API keys in environment variables
          </p>
        </FieldContent>
      </Field>

      <div class="flex items-center gap-2">
        <Button variant="outline" onclick={handleTestEmail} disabled={isTesting}>
          {isTesting ? "Sending..." : "Send Test Email"}
        </Button>
        <p class="text-xs text-muted-foreground">
          Send a test email to verify your email configuration
        </p>
      </div>
    {/if}
  </div>

  <div class="flex justify-end">
    <Button onclick={handleSave} disabled={isSubmitting || !settings}>
      {isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  </div>
</div>

