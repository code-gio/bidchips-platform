<script lang="ts">
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { SiteSettings } from "$lib/types/settings";
  import { toast } from "svelte-sonner";

  interface Props {
    settings: SiteSettings | null;
    onSave: (data: Partial<SiteSettings>) => Promise<void>;
  }

  let { settings, onSave }: Props = $props();

  let siteName = $state("");
  let siteDescription = $state("");
  let contactEmail = $state("");
  let supportEmail = $state("");
  let companyName = $state("");
  let companyStreet = $state("");
  let companyCity = $state("");
  let companyState = $state("");
  let companyZip = $state("");
  let companyCountry = $state("");
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  // Populate form when settings change
  $effect(() => {
    if (settings) {
      siteName = settings.site_name || "";
      siteDescription = settings.site_description || "";
      contactEmail = settings.contact_email || "";
      supportEmail = settings.support_email || "";
      companyName = settings.company_name || "";
      companyStreet = settings.company_street || "";
      companyCity = settings.company_city || "";
      companyState = settings.company_state || "";
      companyZip = settings.company_zip || "";
      companyCountry = settings.company_country || "";
      errors = {};
    }
  });

  function validate(): boolean {
    errors = {};
    if (!siteName.trim()) errors.siteName = "Site name is required";
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.contactEmail = "Invalid email address";
    }
    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      errors.supportEmail = "Invalid email address";
    }
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onSave({
        site_name: siteName.trim(),
        site_description: siteDescription.trim() || null,
        contact_email: contactEmail.trim() || null,
        support_email: supportEmail.trim() || null,
        company_name: companyName.trim() || null,
        company_street: companyStreet.trim() || null,
        company_city: companyCity.trim() || null,
        company_state: companyState.trim() || null,
        company_zip: companyZip.trim() || null,
        company_country: companyCountry.trim() || null,
      });
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Site Information</h2>
    <p class="text-sm text-muted-foreground">Configure your site name and description</p>
  </div>

  <div class="space-y-4">
    <Field>
      <FieldContent>
        <FieldLabel for="siteName">Site Name *</FieldLabel>
        <Input
          id="siteName"
          bind:value={siteName}
          placeholder="My Auction Site"
          required
          aria-invalid={errors.siteName ? "true" : undefined}
        />
      </FieldContent>
      {#if errors.siteName}
        <FieldError errors={[{ message: errors.siteName }]} />
      {/if}
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="siteDescription">Site Description</FieldLabel>
        <textarea
          id="siteDescription"
          bind:value={siteDescription}
          placeholder="A brief description of your auction platform..."
          rows="3"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </FieldContent>
    </Field>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Contact Information</h2>
    <p class="text-sm text-muted-foreground">Email addresses for contact and support</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="contactEmail">Contact Email</FieldLabel>
        <Input
          id="contactEmail"
          type="email"
          bind:value={contactEmail}
          placeholder="contact@example.com"
          aria-invalid={errors.contactEmail ? "true" : undefined}
        />
      </FieldContent>
      {#if errors.contactEmail}
        <FieldError errors={[{ message: errors.contactEmail }]} />
      {/if}
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="supportEmail">Support Email</FieldLabel>
        <Input
          id="supportEmail"
          type="email"
          bind:value={supportEmail}
          placeholder="support@example.com"
          aria-invalid={errors.supportEmail ? "true" : undefined}
        />
      </FieldContent>
      {#if errors.supportEmail}
        <FieldError errors={[{ message: errors.supportEmail }]} />
      {/if}
    </Field>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Company Information</h2>
    <p class="text-sm text-muted-foreground">Your company details and address</p>
  </div>

  <div class="space-y-4">
    <Field>
      <FieldContent>
        <FieldLabel for="companyName">Company Name</FieldLabel>
        <Input
          id="companyName"
          bind:value={companyName}
          placeholder="Company Name Inc."
        />
      </FieldContent>
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="companyStreet">Street Address</FieldLabel>
        <Input
          id="companyStreet"
          bind:value={companyStreet}
          placeholder="123 Main St"
        />
      </FieldContent>
    </Field>

    <div class="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldContent>
          <FieldLabel for="companyCity">City</FieldLabel>
          <Input
            id="companyCity"
            bind:value={companyCity}
            placeholder="City"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel for="companyState">State/Province</FieldLabel>
          <Input
            id="companyState"
            bind:value={companyState}
            placeholder="State"
          />
        </FieldContent>
      </Field>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldContent>
          <FieldLabel for="companyZip">ZIP/Postal Code</FieldLabel>
          <Input
            id="companyZip"
            bind:value={companyZip}
            placeholder="12345"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel for="companyCountry">Country</FieldLabel>
          <Input
            id="companyCountry"
            bind:value={companyCountry}
            placeholder="United States"
          />
        </FieldContent>
      </Field>
    </div>
  </div>

  <div class="flex justify-end">
    <Button onclick={handleSave} disabled={isSubmitting || !settings}>
      {isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  </div>
</div>

