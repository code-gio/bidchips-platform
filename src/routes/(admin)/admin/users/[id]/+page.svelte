<script lang="ts">
  import { page } from "$app/stores";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import UserSummaryTab from "$lib/components/admin/users/UserSummaryTab.svelte";
  import UserAccountInfoTab from "$lib/components/admin/users/UserAccountInfoTab.svelte";
  import UserAddressesTab from "$lib/components/admin/users/UserAddressesTab.svelte";
  import type { User } from "$lib/types/user.js";
  import type { ProfileAddress } from "$lib/types/profile-address.js";
  import { IconArrowLeft } from "@tabler/icons-svelte";

  let { data }: { data: { user: User; addresses: ProfileAddress[] } } = $props();

  const user = $derived(data.user);
  const addresses = $derived(data.addresses ?? []);
  let activeTab = $state("summary");

  function getDisplayName(u: User): string {
    if (u.display_name) return u.display_name;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
    return name || u.email;
  }

  function getInitials(u: User): string {
    if (u.first_name && u.last_name)
      return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
    if (u.display_name) return u.display_name.substring(0, 2).toUpperCase();
    return u.email.substring(0, 2).toUpperCase();
  }
</script>

<svelte:head>
  <title>User: {getDisplayName(user)} | Admin</title>
</svelte:head>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        href="/admin/users"
        class="shrink-0"
        aria-label="Back to users"
      >
        <IconArrowLeft class="size-4" />
      </Button>
      <div class="flex items-center gap-3">
        <Avatar.Root class="size-12">
          <Avatar.Image src={user.avatar_url ?? undefined} alt={getDisplayName(user)} />
          <Avatar.Fallback class="text-lg">{getInitials(user)}</Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{getDisplayName(user)}</h1>
          <p class="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </div>
  </div>

  <Tabs.Root
    value={activeTab}
    onValueChange={(v) => (activeTab = v ?? "summary")}
    class="w-full"
  >
    <Tabs.List class="w-full max-w-md">
      <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
      <Tabs.Trigger value="account">Account Info</Tabs.Trigger>
      <Tabs.Trigger value="addresses">Addresses</Tabs.Trigger>
    </Tabs.List>
    <div class="mt-6">
      <Tabs.Content value="summary" class="mt-0">
        <UserSummaryTab user={user} />
      </Tabs.Content>
      <Tabs.Content value="account" class="mt-0">
        <UserAccountInfoTab user={user} />
      </Tabs.Content>
      <Tabs.Content value="addresses" class="mt-0">
        <UserAddressesTab user={user} addresses={addresses} pathname={$page.url.pathname} />
      </Tabs.Content>
    </div>
  </Tabs.Root>
</div>
