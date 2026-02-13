<script lang="ts">
  import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
  import LogoutIcon from "@tabler/icons-svelte/icons/logout";

  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AvatarWithCrop from "$lib/components/onboarding/avatar-with-crop.svelte";
  import { userNav } from "$lib/config";
  import { page } from "$app/state";
  import { goto, invalidate } from "$app/navigation";
  import { getInitials } from "$lib/utils";

  const SIZE = 32;

  const rawAvatar = $derived(page.data.profile?.avatar_url ?? "");
  /** For private bucket: use signed URL endpoint when avatar_url is path or extract path from storage URL */
  const avatarSrc = $derived.by(() => {
    const v = rawAvatar;
    if (!v) return "";
    if (!v.startsWith("http")) return `/api/user/avatar/signed?path=${encodeURIComponent(v)}`;
    const match = v.match(/\/avatars\/(.+)$/);
    if (match) return `/api/user/avatar/signed?path=${encodeURIComponent(match[1])}`;
    return v;
  });

  const p = $derived(page.data.profile);
  const hasCropParams = $derived(
    p &&
      avatarSrc &&
      p.avatar_crop_x != null &&
      p.avatar_crop_y != null &&
      p.avatar_crop_scale != null &&
      p.avatar_crop_scale > 0 &&
      p.avatar_image_width != null &&
      p.avatar_image_height != null
  );
  const cropProps = $derived({
    cropX: p?.avatar_crop_x ?? null,
    cropY: p?.avatar_crop_y ?? null,
    cropScale: p?.avatar_crop_scale ?? null,
    cropSize: p?.avatar_crop_size ?? 320,
    imageWidth: p?.avatar_image_width ?? null,
    imageHeight: p?.avatar_image_height ?? null,
  });

  const userName = $derived.by(() => {
    const p = page.data.profile;
    if (!p) return "User";
    if (p.display_name) return p.display_name;
    if (p.first_name || p.last_name) return [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    if (p.username) return p.username;
    return "User";
  });
  const user = $derived({
    name: userName,
    email: page.data.profile?.email ?? page.data.user?.email ?? "",
    avatar: avatarSrc,
  });

  const sidebar = Sidebar.useSidebar();

  async function logout() {
    const { error } = await page.data.supabase.auth.signOut();
    if (!error) {
      await invalidate("supabase:auth");
      goto("/sign-in");
    }
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            {#if hasCropParams && avatarSrc}
              <AvatarWithCrop
                src={avatarSrc}
                size={SIZE}
                alt={user.name}
                class="rounded-lg grayscale"
                cropX={cropProps.cropX}
                cropY={cropProps.cropY}
                cropScale={cropProps.cropScale}
                cropSize={cropProps.cropSize}
                imageWidth={cropProps.imageWidth}
                imageHeight={cropProps.imageHeight}
              />
            {:else}
              <Avatar.Root class="size-8 rounded-lg grayscale">
                <Avatar.Image src={user.avatar} alt={user.name} />
                <Avatar.Fallback class="rounded-lg">
                  {getInitials(user.name)}
                </Avatar.Fallback>
              </Avatar.Root>
            {/if}
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <DotsVerticalIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            {#if hasCropParams && avatarSrc}
              <AvatarWithCrop
                src={avatarSrc}
                size={SIZE}
                alt={user.name}
                class="rounded-lg"
                cropX={cropProps.cropX}
                cropY={cropProps.cropY}
                cropScale={cropProps.cropScale}
                cropSize={cropProps.cropSize}
                imageWidth={cropProps.imageWidth}
                imageHeight={cropProps.imageHeight}
              />
            {:else}
              <Avatar.Root class="size-8 rounded-lg">
                <Avatar.Image src={user.avatar} alt={user.name} />
                <Avatar.Fallback class="rounded-lg">
                  {getInitials(user.name)}
                </Avatar.Fallback>
              </Avatar.Root>
            {/if}
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          {#each userNav as item}
            <DropdownMenu.Item>
              {#snippet child({ props })}
                <a href={item.url} {...props}>
                  <item.icon />
                  {item.title}
                </a>
              {/snippet}
              {item.title}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={logout}>
          <LogoutIcon />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
