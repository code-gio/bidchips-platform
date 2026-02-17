<script lang="ts">
  import OnboardingGoals from "$lib/components/onboarding/onboarding-goals.svelte";
  import OnboardingLayout from "$lib/components/onboarding/onboarding-layout.svelte";
  import OnboardingForm from "$lib/components/onboarding/onboarding-form.svelte";
  import OnboardingPreview from "$lib/components/onboarding/onboarding-preview.svelte";
  import type { PageData } from "./$types.js";

  let { data }: { data: PageData } = $props();

  let step = $state(2 as 2 | 1);
  let selectedGoal = $state<string | null>(null);

  let formDataOverride = $state<Record<string, unknown> | null>(null);
  const formData = $derived.by(() => {
    const fromData = {
      display_name: data.profile?.display_name ?? data.form?.data?.display_name ?? "",
      username: data.profile?.username ?? data.form?.data?.username ?? "",
      country: data.profile?.country ?? data.form?.data?.country ?? "us",
      address_street: data.form?.data?.address_street ?? "",
      address_city: data.form?.data?.address_city ?? "",
      address_state: data.form?.data?.address_state ?? "",
      address_zip: data.form?.data?.address_zip ?? "",
      avatar_url: data.profile?.avatar_url ?? data.form?.data?.avatar_url ?? "",
      avatar_crop_x: data.profile?.avatar_crop_x ?? data.form?.data?.avatar_crop_x ?? null,
      avatar_crop_y: data.profile?.avatar_crop_y ?? data.form?.data?.avatar_crop_y ?? null,
      avatar_crop_scale: data.profile?.avatar_crop_scale ?? data.form?.data?.avatar_crop_scale ?? null,
      avatar_crop_size: data.profile?.avatar_crop_size ?? data.form?.data?.avatar_crop_size ?? null,
      avatar_image_width: data.profile?.avatar_image_width ?? data.form?.data?.avatar_image_width ?? null,
      avatar_image_height: data.profile?.avatar_image_height ?? data.form?.data?.avatar_image_height ?? null,
    };
    if (formDataOverride) {
      return { ...fromData, ...formDataOverride };
    }
    return fromData;
  });
</script>

<!-- {#if step === 1}
  <OnboardingGoals
    bind:selectedGoal
    onContinue={() => (step = 2)}
  />
{:else} -->
  <OnboardingLayout
    title="Complete your profile"
    subtitle="Set up your profile."
    formData={formData}
    step={2}
    onBack={() => (step = 1)}
  >
    {#snippet formSlot()}
      <OnboardingForm
        data={data.form}
        initialData={data.profile}
        onDataChange={(d) => (formDataOverride = d)}
        onBack={() => (step = 1)}
      />
    {/snippet}
    {#snippet previewSlot(previewData)}
      <OnboardingPreview data={previewData} />
    {/snippet}
  </OnboardingLayout>
<!-- {/if} -->
