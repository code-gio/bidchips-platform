<script lang="ts">
  import { timezones } from "$lib/data/timezones.js";
  import { countries } from "$lib/data/countries.js";
  import { languages } from "$lib/data/languages.js";
  import { getInitials } from "$lib/utils.js";
  import Separator from "../ui/separator/separator.svelte";
  import AvatarWithCrop from "./avatar-with-crop.svelte";

  let { data = {} }: { data?: Record<string, unknown> } = $props();

  const displayName = $derived((data.display_name as string) ?? "");
  const email = $derived((data.email as string) ?? "");
  const userName = $derived((data.username as string) ?? "");
  const timeZoneValue = $derived((data.time_zone as string) ?? "UTC");
  const avatarUrl = $derived((data.avatar_url as string) ?? "");
  const avatarCropX = $derived(data.avatar_crop_x as number | null | undefined);
  const avatarCropY = $derived(data.avatar_crop_y as number | null | undefined);
  const avatarCropScale = $derived(data.avatar_crop_scale as number | null | undefined);
  const avatarCropSize = $derived(data.avatar_crop_size as number | null | undefined);
  const avatarImageWidth = $derived(data.avatar_image_width as number | null | undefined);
  const avatarImageHeight = $derived(data.avatar_image_height as number | null | undefined);
  /** For private bucket: avatar_url may be path or old public URL; use signed endpoint when path or extract path from URL */
  const avatarSrc = $derived.by(() => {
    const v = avatarUrl;
    if (!v) return "";
    if (!v.startsWith("http")) return `/api/user/avatar/signed?path=${encodeURIComponent(v)}`;
    const match = v.match(/\/avatars\/(.+)$/);
    if (match) return `/api/user/avatar/signed?path=${encodeURIComponent(match[1])}`;
    return v;
  });
  const countryCode = $derived(((data.country as string) ?? "").toLowerCase());
  const tagline = $derived((data.tagline as string) ?? "");
  const languageCode = $derived((data.language as string) ?? "");
  const birthDate = $derived((data.birth_date as string) ?? "");
  const addressStreet = $derived((data.address_street as string) ?? "");
  const addressCity = $derived((data.address_city as string) ?? "");
  const addressState = $derived((data.address_state as string) ?? "");
  const addressZip = $derived((data.address_zip as string) ?? "");
  const addressLine2 = $derived(
    [addressCity, addressState, addressZip].filter(Boolean).join(", ")
  );
  const hasAddress = $derived(Boolean(addressStreet || addressLine2));

  const timeZoneLabel = $derived(
    timezones.find((t) => t.value === timeZoneValue)?.text ?? timeZoneValue
  );
  const countryLabel = $derived(
    countries.find((c) => c.code.toLowerCase() === countryCode)?.country ?? ""
  );
  const languageLabel = $derived.by(() => {
    const lang = languages.find((l) => l.code === languageCode);
    return lang?.name ?? lang?.englishName ?? "";
  });
  const ageDisplay = $derived.by(() => {
    if (!birthDate.trim()) return null;
    const d = new Date(birthDate + "T12:00:00.000Z");
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 0 ? age : null;
  });

  const hasData = $derived(
    Boolean(displayName || userName || avatarSrc || timeZoneLabel || countryLabel || tagline || languageLabel || ageDisplay != null || hasAddress)
  );

  const fullNameDisplay = $derived(displayName || "Full Name");
  const usernameDisplay = $derived(userName ? `@${userName}` : "User name");
  const isPlaceholderName = $derived(!displayName);
  const isPlaceholderUsername = $derived(!userName);
  const bio = $derived((data.bio as string) ?? "");
</script>

<div
  class="rounded-xl border bg-card p-6 shadow-sm"
  style="box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);"
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-center text-center">
      {#if avatarSrc}
        <div class="ring-2 ring-muted rounded-full">
          <AvatarWithCrop
            src={avatarSrc}
            size={120}
            alt=""
            cropX={avatarCropX}
            cropY={avatarCropY}
            cropScale={avatarCropScale}
            cropSize={avatarCropSize}
            imageWidth={avatarImageWidth}
            imageHeight={avatarImageHeight}
          />
        </div>
      {:else}
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-muted-foreground"
        >
          <span class="text-5xl font-medium">
            {getInitials(displayName || email) || "?"}
          </span>
        </div>
      {/if}
      <div class="mt-3 space-y-0.5">
        <div
          class="text-3xl font-medium text-foreground"
          class:text-muted-foreground={isPlaceholderName}
        >
          {fullNameDisplay}
        </div>
        <div
          class="text-md font-semibold"
          class:text-muted-foreground={isPlaceholderUsername}
          class:font-medium={!isPlaceholderUsername}
        >
          {usernameDisplay}
        </div>
      </div>
    </div>

    <div class="space-y-3 ">
      <Separator class="my-4" />

      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Age</span>
        <span class="text-md {ageDisplay != null ? 'text-foreground' : 'text-muted-foreground'}">
          {ageDisplay != null ? ageDisplay : "Age"}
        </span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Country</span>
        <span class="text-md {countryLabel ? 'text-foreground' : 'text-muted-foreground'}">
          {countryLabel || "Country"}
        </span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Address</span>
        <span class="text-md {hasAddress ? 'text-foreground' : 'text-muted-foreground'} min-h-[1.25rem]">
          {#if hasAddress}
            {#if addressStreet}{addressStreet}{/if}
            {#if addressStreet && addressLine2}<br />{/if}
            {#if addressLine2}{addressLine2}{/if}
          {:else}
            Address
          {/if}
        </span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Time zone</span>
        <span class="text-md {timeZoneLabel && timeZoneValue !== 'UTC' ? 'text-foreground' : 'text-muted-foreground'}">
          {timeZoneLabel || "Timezone"}
        </span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Language</span>
        <span class="text-md {languageLabel ? 'text-foreground' : 'text-muted-foreground'}">
          {languageLabel || "Language"}
        </span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tagline</span>
        <span class="text-md {tagline ? 'text-foreground' : 'text-muted-foreground'} min-h-[1.25rem]">
          {tagline || "Tagline"}
        </span>
      </div>
      <!-- <Separator class="my-4" />
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bio</span>
        <span class="text-md {bio ? 'text-foreground' : 'text-muted-foreground'} min-h-[1.25rem]">
          {bio || "Bio"}
        </span>
      </div> -->
    </div>
  </div>
</div>
