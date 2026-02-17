<script lang="ts">
  import { countries } from "$lib/data/countries.js";
  import { getInitials } from "$lib/utils.js";
  import AvatarWithCrop from "./avatar-with-crop.svelte";
  import MapPinIcon from "@lucide/svelte/icons/map-pin";
  import GlobeIcon from "@lucide/svelte/icons/globe";

  let { data = {} }: { data?: Record<string, unknown> } = $props();

  const displayName = $derived((data.display_name as string) ?? "");
  const userName = $derived((data.username as string) ?? "");
  const avatarUrl = $derived((data.avatar_url as string) ?? "");
  const avatarCropX = $derived(data.avatar_crop_x as number | null | undefined);
  const avatarCropY = $derived(data.avatar_crop_y as number | null | undefined);
  const avatarCropScale = $derived(
    data.avatar_crop_scale as number | null | undefined,
  );
  const avatarCropSize = $derived(
    data.avatar_crop_size as number | null | undefined,
  );
  const avatarImageWidth = $derived(
    data.avatar_image_width as number | null | undefined,
  );
  const avatarImageHeight = $derived(
    data.avatar_image_height as number | null | undefined,
  );

  const avatarSrc = $derived.by(() => {
    const v = avatarUrl;
    if (!v) return "";
    if (!v.startsWith("http"))
      return `/api/user/avatar/signed?path=${encodeURIComponent(v)}`;
    const match = v.match(/\/avatars\/(.+)$/);
    if (match)
      return `/api/user/avatar/signed?path=${encodeURIComponent(match[1])}`;
    return v;
  });

  const countryCode = $derived(((data.country as string) ?? "").toLowerCase());
  const addressStreet = $derived((data.address_street as string) ?? "");
  const addressCity = $derived((data.address_city as string) ?? "");
  const addressState = $derived((data.address_state as string) ?? "");
  const addressZip = $derived((data.address_zip as string) ?? "");

  const countryLabel = $derived(
    countries.find((c) => c.code.toLowerCase() === countryCode)?.country ?? "",
  );

  const addressParts = $derived(
    [addressStreet, addressCity, addressState, addressZip].filter(Boolean),
  );
  const hasAddress = $derived(addressParts.length > 0);
  const addressLine = $derived(addressParts.join(", "));

  const hasData = $derived(
    Boolean(displayName || userName || avatarSrc || countryLabel || hasAddress),
  );

  const initials = $derived(getInitials(displayName || userName) || "?");
</script>

<div
  class="rounded-2xl border border-border/60 bg-card p-6 shadow-lg"
  style="box-shadow: 0 4px 14px rgb(0 0 0 / 0.06);"
>
  <div class="flex flex-col gap-5">
    <!-- Avatar + name and username -->
    <div class="flex flex-col items-center gap-3 text-center">
      {#if avatarSrc}
        <div class="ring-2 ring-primary/20 ring-offset-2 ring-offset-card rounded-full overflow-hidden">
          <AvatarWithCrop
            src={avatarSrc}
            size={100}
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
          class="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-3xl"
        >
          {initials}
        </div>
      {/if}
      <div class="space-y-0.5">
        <p
          class="text-xl font-semibold text-foreground"
          class:text-muted-foreground={!displayName}
        >
          {displayName || "Your name"}
        </p>
        <p
          class="text-sm font-medium"
          class:text-muted-foreground={!userName}
          class:text-foreground={!!userName}
        >
          {#if userName}
            @{userName}
          {:else}
            @username
          {/if}
        </p>
      </div>
    </div>

    <!-- Data in clear blocks -->
    <div class="space-y-3 border-t border-border/50 pt-4">
      {#if countryLabel}
        <div class="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
          <GlobeIcon class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Country</p>
            <p class="text-sm font-medium text-foreground">{countryLabel}</p>
          </div>
        </div>
      {:else}
        <div class="flex items-start gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
          <GlobeIcon class="size-4 mt-0.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Country</p>
            <p class="text-sm text-muted-foreground/90">Select your country</p>
          </div>
        </div>
      {/if}

      {#if hasAddress}
        <div class="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
          <MapPinIcon class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</p>
            <p class="text-sm font-medium text-foreground leading-snug">{addressLine}</p>
          </div>
        </div>
      {:else}
        <div class="flex items-start gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
          <MapPinIcon class="size-4 mt-0.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Address</p>
            <p class="text-sm text-muted-foreground/90">Street, city, state and postal code</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
