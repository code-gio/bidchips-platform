<script lang="ts">
  import {
    Field,
    FieldContent,
    FieldLabel,
    FieldError,
  } from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    onboardingSchema,
    type OnboardingSchema,
  } from "$lib/schemas/onboarding.js";
  import { countries } from "$lib/data/countries.js";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import CameraIcon from "@lucide/svelte/icons/camera";
  import { cn } from "$lib/utils.js";
  import AvatarCropDialog from "./avatar-crop-dialog.svelte";
  import AvatarWithCrop from "./avatar-with-crop.svelte";

  const inputSizeClass = "";

  let {
    data,
    onDataChange,
    onBack,
  }: {
    data: SuperValidated<Infer<OnboardingSchema>>;
    initialData?: Record<string, unknown> | null;
    onDataChange?: (data: Record<string, unknown>) => void;
    onBack?: () => void;
  } = $props();

  const form = superForm(data, {
    validators: zod4Client(onboardingSchema),
    validationMethod: "submit-only",
    onSubmit: () => {},
    onResult: ({ result }) => {
      if (result.type === "failure") {
        toast.error(result.data?.message ?? "Please check your input.");
      }
    },
  });

  const { form: formData, enhance, errors } = form;

  const avatarInputId = "onboarding-avatar-input";
  let isUploadingAvatar = $state(false);
  let avatarCropOpen = $state(false);
  let countryOpen = $state(false);

  const selectedCountryLabel = $derived(
    countries.find((c) => c.code === $formData.country)?.country ?? "Country",
  );

  /** For private bucket: avatar_url may be path or old public URL; use signed endpoint when path or extract path from URL */
  const avatarSrc = $derived.by(() => {
    const v = $formData.avatar_url ?? "";
    if (!v) return "";
    if (!v.startsWith("http"))
      return `/api/user/avatar/signed?path=${encodeURIComponent(v)}`;
    const match = v.match(/\/avatars\/(.+)$/);
    if (match)
      return `/api/user/avatar/signed?path=${encodeURIComponent(match[1])}`;
    return v;
  });

  function normalizeErrors(error: unknown): { message?: string }[] | undefined {
    if (!error) return undefined;
    if (typeof error === "string") return [{ message: error }];
    if (Array.isArray(error)) {
      return error.map((e) => ({
        message: typeof e === "string" ? e : String(e),
      }));
    }
    return [{ message: String(error) }];
  }

  function getInitials(displayName: string, username: string): string {
    const name = (displayName || "").trim();
    if (name) return name.charAt(0).toUpperCase();
    const u = (username || "").trim();
    if (u) return u.charAt(0).toUpperCase();
    return "?";
  }

  $effect(() => {
    onDataChange?.({ ...$formData } as Record<string, unknown>);
  });

  // Default to United States (code "us" from countries data) when country is empty
  $effect(() => {
    const country = ($formData.country ?? "").trim().toLowerCase();
    if (country === "") {
      $formData.country = "us";
    }
  });

  function openAvatarCrop() {
    avatarCropOpen = true;
  }

  async function handleCropComplete(
    blob: Blob,
    params: {
      x: number;
      y: number;
      scale: number;
      cropSize: number;
      imageWidth: number;
      imageHeight: number;
    },
  ) {
    isUploadingAvatar = true;
    try {
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : blob.type === "image/gif"
              ? "gif"
              : "jpg";
      const file = new File([blob], `avatar.${ext}`, {
        type: blob.type || "image/jpeg",
      });
      const formDataUpload = new FormData();
      formDataUpload.set("avatar", file);
      const res = await fetch("/api/user/avatar/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? "Upload failed");
        return;
      }
      if (json?.data?.path) {
        $formData.avatar_url = json.data.path;
        $formData.avatar_crop_x = params.x;
        $formData.avatar_crop_y = params.y;
        $formData.avatar_crop_scale = params.scale;
        $formData.avatar_crop_size = params.cropSize;
        $formData.avatar_image_width = params.imageWidth;
        $formData.avatar_image_height = params.imageHeight;
      }
      toast.success("Photo updated");
    } catch (err) {
      toast.error("Failed to upload avatar");
    } finally {
      isUploadingAvatar = false;
    }
  }
</script>

<form method="POST" use:enhance class="flex flex-col space-y-5" novalidate>
  <input
    type="hidden"
    name="avatar_url"
    value={$formData.avatar_url}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_crop_x"
    value={$formData.avatar_crop_x ?? ""}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_crop_y"
    value={$formData.avatar_crop_y ?? ""}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_crop_scale"
    value={$formData.avatar_crop_scale ?? ""}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_crop_size"
    value={$formData.avatar_crop_size ?? ""}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_image_width"
    value={$formData.avatar_image_width ?? ""}
    aria-hidden="true"
  />
  <input
    type="hidden"
    name="avatar_image_height"
    value={$formData.avatar_image_height ?? ""}
    aria-hidden="true"
  />

  <!-- <p class="text-sm text-muted-foreground font-semibold">
    Add a photo to help build connection and trust.
  </p> -->
  <div class="space-y-2">
    <AvatarCropDialog
      bind:open={avatarCropOpen}
      currentAvatarUrl={avatarSrc}
      initialCrop={$formData.avatar_crop_x != null &&
      $formData.avatar_crop_y != null &&
      $formData.avatar_crop_scale != null
        ? {
            x: Number($formData.avatar_crop_x),
            y: Number($formData.avatar_crop_y),
            scale: Number($formData.avatar_crop_scale),
          }
        : null}
      onCropComplete={handleCropComplete}
    />
    <button
      type="button"
      class="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onclick={openAvatarCrop}
      disabled={isUploadingAvatar}
      aria-label="Upload profile photo"
    >
      <span
        class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-muted transition-opacity hover:opacity-90"
      >
        {#if avatarSrc}
          <AvatarWithCrop
            src={avatarSrc}
            size={96}
            alt="Avatar"
            cropX={$formData.avatar_crop_x}
            cropY={$formData.avatar_crop_y}
            cropScale={$formData.avatar_crop_scale}
            cropSize={$formData.avatar_crop_size}
            imageWidth={$formData.avatar_image_width}
            imageHeight={$formData.avatar_image_height}
          />
        {:else}
          <span
            class="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl text-muted-foreground"
          >
            {#if $formData.avatar_url}
              {getInitials($formData.display_name ?? "", $formData.username ?? "")}
            {:else}
              <CameraIcon class="size-10 text-muted-foreground" />
            {/if}
          </span>
        {/if}
      </span>
    </button>
    {#if isUploadingAvatar}
      <p class="text-xs text-muted-foreground">Uploading…</p>
    {:else}
      <p class="text-xs text-muted-foreground">
        Click the avatar to upload a photo (max 5MB)
      </p>
    {/if}
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <!-- <FieldLabel for="display_name">Full name</FieldLabel> -->
        <Input
          id="display_name"
          name="display_name"
          bind:value={$formData.display_name}
          placeholder="Full name"
          autocomplete="name"
          class={inputSizeClass}
          aria-invalid={$errors.display_name ? "true" : undefined}
        />
      </FieldContent>
      <FieldError
        id="display_name-error"
        errors={normalizeErrors($errors.display_name)}
      />
    </Field>
    <Field>
      <FieldContent>
        <!-- <FieldLabel for="username">User Name</FieldLabel> -->
        <Input
          id="username"
          name="username"
          bind:value={$formData.username}
          placeholder="User Name"
          autocomplete="username"
          class={inputSizeClass}
          aria-invalid={$errors.username ? "true" : undefined}
        />
      </FieldContent>
      <FieldError
        id="username-error"
        errors={normalizeErrors($errors.username)}
      />
      <!-- <p class="mt-1 text-xs text-muted-foreground">
        Letters, numbers, underscores and hyphens only.
      </p> -->
    </Field>
  </div>

  <!-- <Field>
    <FieldContent>
      <FieldLabel for="tagline">Tagline <span class="text-muted-foreground">(optional)</span></FieldLabel>
      <Input
        id="tagline"
        name="tagline"
        bind:value={$formData.tagline}
        placeholder="Tagline (A short description of what you do)"
        class={inputSizeClass}
      />
    </FieldContent>
  </Field> -->

  <p class="text-sm text-muted-foreground font-semibold">Address</p>
  <Field>
    <FieldContent>
      <Input
        id="address_street"
        name="address_street"
        bind:value={$formData.address_street}
        placeholder="Street address"
        autocomplete="street-address"
        class={inputSizeClass}
        aria-invalid={$errors.address_street ? "true" : undefined}
      />
    </FieldContent>
    <FieldError
      id="address_street-error"
      errors={normalizeErrors($errors.address_street)}
    />
  </Field>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <!-- <FieldLabel for="country">Country</FieldLabel> -->
        <input
          type="hidden"
          name="country"
          value={$formData.country}
          aria-hidden="true"
        />
        <Popover.Root bind:open={countryOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="outline"
                class="w-full justify-between font-normal {inputSizeClass}"
                role="combobox"
                aria-expanded={countryOpen}
                aria-invalid={$errors.country ? "true" : undefined}
                id="country"
              >
                <span class="truncate text-left">{selectedCountryLabel}</span>
                <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-[var(--bits-popover-trigger-width)] p-0">
            <Command.Root bind:value={$formData.country}>
              <Command.Input placeholder="Search country..." />
              <Command.List>
                <Command.Empty>No country found.</Command.Empty>
                <Command.Group value="countries">
                  {#each countries as c, i (i)}
                    <Command.Item
                      value={c.code}
                      keywords={[c.country]}
                      onSelect={() => {
                        $formData.country = c.code;
                        countryOpen = false;
                      }}
                    >
                      <CheckIcon
                        class={cn(
                          $formData.country !== c.code && "text-transparent",
                        )}
                      />
                      {c.country}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </FieldContent>
      <FieldError
        id="country-error"
        errors={normalizeErrors($errors.country)}
      />
    </Field>
    <Field>
      <FieldContent>
        <Input
          id="address_state"
          name="address_state"
          bind:value={$formData.address_state}
          placeholder="State / Province"
          autocomplete="address-level1"
          class={inputSizeClass}
          aria-invalid={$errors.address_state ? "true" : undefined}
        />
      </FieldContent>
      <FieldError
        id="address_state-error"
        errors={normalizeErrors($errors.address_state)}
      />
    </Field>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <Input
          id="address_city"
          name="address_city"
          bind:value={$formData.address_city}
          placeholder="City"
          autocomplete="address-level2"
          class={inputSizeClass}
          aria-invalid={$errors.address_city ? "true" : undefined}
        />
      </FieldContent>
      <FieldError
        id="address_city-error"
        errors={normalizeErrors($errors.address_city)}
      />
    </Field>
    <Field>
      <FieldContent>
        <Input
          id="address_zip"
          name="address_zip"
          bind:value={$formData.address_zip}
          placeholder="ZIP / Postal code"
          autocomplete="postal-code"
          class={inputSizeClass}
          aria-invalid={$errors.address_zip ? "true" : undefined}
        />
      </FieldContent>
      <FieldError
        id="address_zip-error"
        errors={normalizeErrors($errors.address_zip)}
      />
    </Field>
  </div>

  <div class="mt-6 flex flex-wrap items-center gap-4">
    <!-- {#if onBack}
      <Button
        type="button"
        size="icon"
        variant="outline"
        onclick={onBack}
        aria-label="Back"
        class=" cursor-pointer"
      >
        <ChevronLeftIcon class="size-4 text-white" />
      </Button>
    {/if} -->
    <Button
      type="submit"
      variant="default"
      class="min-w-[180px]  cursor-pointer"
    >
      Complete onboarding
    </Button>
  </div>
</form>
