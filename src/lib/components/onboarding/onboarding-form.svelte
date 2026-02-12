<script lang="ts">
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import { onboardingSchema, type OnboardingSchema } from "$lib/schemas/onboarding.js";
  import { timezones } from "$lib/data/timezones.js";
  import { languages } from "$lib/data/languages.js";
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
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import CameraIcon from "@lucide/svelte/icons/camera";
  import { tick } from "svelte";
  import { cn } from "$lib/utils.js";
  import { getLocalTimeZone, today, parseDate, type DateValue } from "@internationalized/date";

  const inputSizeClass = "h-11 text-base rounded-lg px-3";

  let { data, initialData = null, onDataChange, onBack }: {
    data: SuperValidated<Infer<OnboardingSchema>>;
    initialData?: Record<string, unknown> | null;
    onDataChange?: (data: Record<string, unknown>) => void;
    onBack?: () => void;
  } = $props();

  const form = superForm(data, {
    validators: zod4Client(onboardingSchema),
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
  let timezoneOpen = $state(false);
  let languageOpen = $state(false);
  let countryOpen = $state(false);
  let birthDateOpen = $state(false);
  let timezoneTriggerRef = $state<HTMLButtonElement>(null!);

  let birthDateValue = $state<DateValue | undefined>(undefined);

  const selectedTimezoneLabel = $derived(
    timezones.find((tz) => tz.value === $formData.time_zone)?.text ?? "Timezone"
  );
  const selectedLanguageLabel = $derived(
    languages.find((l) => l.code === $formData.language)?.name ?? "Language"
  );
  const selectedCountryLabel = $derived(
    countries.find((c) => c.code === $formData.country)?.country ?? "Country"
  );

  /** For private bucket: avatar_url may be path or old public URL; use signed endpoint when path or extract path from URL */
  const avatarSrc = $derived.by(() => {
    const v = $formData.avatar_url ?? "";
    if (!v) return "";
    if (!v.startsWith("http")) return `/api/user/avatar/signed?path=${encodeURIComponent(v)}`;
    const match = v.match(/\/avatars\/(.+)$/);
    if (match) return `/api/user/avatar/signed?path=${encodeURIComponent(match[1])}`;
    return v;
  });

  $effect(() => {
    const s = ($formData.birth_date ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      try {
        birthDateValue = parseDate(s);
      } catch {
        birthDateValue = undefined;
      }
    } else {
      birthDateValue = undefined;
    }
  });

  function closeTimezoneAndFocusTrigger() {
    timezoneOpen = false;
    tick().then(() => timezoneTriggerRef?.focus());
  }

  function normalizeErrors(error: unknown): { message?: string }[] | undefined {
    if (!error) return undefined;
    if (typeof error === "string") return [{ message: error }];
    if (Array.isArray(error)) {
      return error.map((e) => ({ message: typeof e === "string" ? e : String(e) }));
    }
    return [{ message: String(error) }];
  }

  function getInitials(displayName: string, email: string): string {
    const name = (displayName || "").trim();
    if (name) return name.charAt(0).toUpperCase();
    const e = (email || "").trim();
    if (e) return e.charAt(0).toUpperCase();
    return "?";
  }

  function onBirthDateChange(value: DateValue | undefined) {
    if (value) {
      $formData.birth_date = value.toString();
      birthDateOpen = false;
    }
  }

  $effect(() => {
    onDataChange?.({ ...$formData } as Record<string, unknown>);
  });

  function triggerAvatarInput() {
    document.getElementById(avatarInputId)?.click();
  }

  async function handleAvatarFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File must be less than 5MB");
      input.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, GIF, WebP)");
      input.value = "";
      return;
    }
    isUploadingAvatar = true;
    input.value = "";
    try {
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
      }
    } catch (err) {
      toast.error("Failed to upload avatar");
    } finally {
      isUploadingAvatar = false;
    }
  }
</script>

<form method="POST" use:enhance class="flex flex-col space-y-5" novalidate>
  <input type="hidden" name="avatar_url" value={$formData.avatar_url} aria-hidden="true" />

  <p class="text-sm text-muted-foreground">Add a photo to help build connection and trust.</p>
  <div class="space-y-2">
    <input
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      class="sr-only"
      id={avatarInputId}
      onchange={handleAvatarFileChange}
      disabled={isUploadingAvatar}
    />
    <button
      type="button"
      class="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onclick={triggerAvatarInput}
      disabled={isUploadingAvatar}
      aria-label="Upload profile photo"
    >
      <Avatar.Root class="h-24 w-24 cursor-pointer border-2 border-muted transition-opacity hover:opacity-90">
        {#if avatarSrc}
          <Avatar.Image src={avatarSrc} alt="Avatar" />
        {/if}
        <Avatar.Fallback class="text-2xl text-muted-foreground">
          {#if $formData.avatar_url}
            {getInitials($formData.display_name ?? "", "")}
          {:else}
            <CameraIcon class="size-10 text-muted-foreground" />
          {/if}
        </Avatar.Fallback>
      </Avatar.Root>
    </button>
    {#if isUploadingAvatar}
      <p class="text-xs text-muted-foreground">Uploading…</p>
    {:else}
      <p class="text-xs text-muted-foreground">Click the avatar to upload a photo (max 5MB)</p>
    {/if}
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="display_name">Full name</FieldLabel>
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
      <FieldError id="display_name-error" errors={normalizeErrors($errors.display_name)} />
    </Field>
    <Field>
      <FieldContent>
        <FieldLabel for="username">User Name</FieldLabel>
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
      <FieldError id="username-error" errors={normalizeErrors($errors.username)} />
      <p class="mt-1 text-xs text-muted-foreground">
        Letters, numbers, underscores and hyphens only.
      </p>
    </Field>
  </div>

  <Field>
    <FieldContent>
      <FieldLabel for="tagline">Tagline <span class="text-muted-foreground">(optional)</span></FieldLabel>
      <Input
        id="tagline"
        name="tagline"
        bind:value={$formData.tagline}
        placeholder="A short description of what you do"
        class={inputSizeClass}
      />
    </FieldContent>
  </Field>

  <Field>
    <FieldContent>
      <FieldLabel for="bio">Bio <span class="text-muted-foreground">(optional)</span></FieldLabel>
      <textarea
        id="bio"
        name="bio"
        bind:value={$formData.bio}
        placeholder="Tell us a bit about yourself"
        rows={4}
        class="border border-input bg-background rounded-lg px-3 py-2 text-base w-full resize-y min-h-[6rem] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      ></textarea>
    </FieldContent>
  </Field>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="language">Language</FieldLabel>
        <input type="hidden" name="language" value={$formData.language} aria-hidden="true" />
        <Popover.Root bind:open={languageOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="outline"
                class="w-full justify-between font-normal {inputSizeClass}"
                role="combobox"
                aria-expanded={languageOpen}
                aria-invalid={$errors.language ? "true" : undefined}
                id="language"
              >
                <span class="truncate text-left">{selectedLanguageLabel}</span>
                <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-[var(--bits-popover-trigger-width)] p-0">
            <Command.Root bind:value={$formData.language}>
              <Command.Input placeholder="Search language..." />
              <Command.List>
                <Command.Empty>No language found.</Command.Empty>
                <Command.Group value="languages">
                  {#each languages as lang (lang.code)}
                    <Command.Item
                      value={lang.code}
                      keywords={[lang.name, lang.englishName ?? ""]}
                      onSelect={() => {
                        $formData.language = lang.code;
                        languageOpen = false;
                      }}
                    >
                      <CheckIcon class={cn($formData.language !== lang.code && "text-transparent")} />
                      <span class="mr-2">{lang.flag}</span>
                      {lang.name}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </FieldContent>
      <FieldError id="language-error" errors={normalizeErrors($errors.language)} />
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="time_zone">Timezone</FieldLabel>
        <input type="hidden" name="time_zone" value={$formData.time_zone} aria-hidden="true" />
        <Popover.Root bind:open={timezoneOpen}>
          <Popover.Trigger bind:ref={timezoneTriggerRef}>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="outline"
                class="w-full justify-between font-normal {inputSizeClass}"
                role="combobox"
                aria-expanded={timezoneOpen}
                aria-invalid={$errors.time_zone ? "true" : undefined}
                id="time_zone"
              >
                <span class="truncate text-left">{selectedTimezoneLabel}</span>
                <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-[var(--bits-popover-trigger-width)] p-0">
            <Command.Root bind:value={$formData.time_zone}>
              <Command.Input placeholder="Search timezone..." />
              <Command.List>
                <Command.Empty>No timezone found.</Command.Empty>
                <Command.Group value="timezones">
                  {#each timezones as tz, i (i)}
                    <Command.Item
                      value={tz.value}
                      keywords={[tz.text]}
                      onSelect={() => {
                        $formData.time_zone = tz.value;
                        closeTimezoneAndFocusTrigger();
                      }}
                    >
                      <CheckIcon class={cn($formData.time_zone !== tz.value && "text-transparent")} />
                      {tz.text}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </FieldContent>
      <FieldError id="time_zone-error" errors={normalizeErrors($errors.time_zone)} />
    </Field>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="country">Country</FieldLabel>
        <input type="hidden" name="country" value={$formData.country} aria-hidden="true" />
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
                      <CheckIcon class={cn($formData.country !== c.code && "text-transparent")} />
                      {c.country}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </FieldContent>
      <FieldError id="country-error" errors={normalizeErrors($errors.country)} />
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="birth_date">Birth date</FieldLabel>
        <input type="hidden" name="birth_date" value={$formData.birth_date} aria-hidden="true" />
        <Popover.Root bind:open={birthDateOpen}>
          <Popover.Trigger id="birth_date">
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="outline"
                class="w-full justify-between font-normal {inputSizeClass}"
                aria-invalid={$errors.birth_date ? "true" : undefined}
              >
                {#if $formData.birth_date}
                  {new Date($formData.birth_date + "T12:00:00.000Z").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                {:else}
                  Select date
                {/if}
                <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-auto p-0" align="start">
            <Calendar
              type="single"
              bind:value={birthDateValue}
              captionLayout="dropdown"
              maxValue={today(getLocalTimeZone())}
              onValueChange={onBirthDateChange}
            />
          </Popover.Content>
        </Popover.Root>
      </FieldContent>
      <FieldError id="birth_date-error" errors={normalizeErrors($errors.birth_date)} />
    </Field>
  </div>

  <div class="mt-6 flex flex-wrap items-center gap-2">
    {#if onBack}
      <Button type="button" variant="outline" size="icon" onclick={onBack} aria-label="Back">
        <ChevronLeftIcon class="size-4" />
      </Button>
    {/if}
    <Button type="submit" class="min-w-[180px]">
      Complete onboarding
    </Button>
  </div>
</form>
