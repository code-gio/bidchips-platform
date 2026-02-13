<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import AddressFormModal from "./AddressFormModal.svelte";
  import type { User } from "$lib/types/user.js";
  import type { ProfileAddress } from "$lib/types/profile-address.js";
  import { countries } from "$lib/data/countries.js";

  let {
    user,
    addresses = [],
    pathname,
  }: {
    user: User;
    addresses: ProfileAddress[];
    pathname: string;
  } = $props();

  let modalOpen = $state(false);
  let editingAddress = $state<ProfileAddress | null>(null);

  const displayName = $derived(
    user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      user.email
  );

  function countryName(code: string | null): string {
    if (!code) return "";
    const c = countries.find((x) => x.code.toLowerCase() === code.toLowerCase());
    return c?.country ?? code;
  }

  function openAddModal() {
    editingAddress = null;
    modalOpen = true;
  }

  function openEditModal(addr: ProfileAddress) {
    editingAddress = addr;
    modalOpen = true;
  }

  async function afterModalSuccess() {
    await invalidateAll();
  }
</script>

<div class="space-y-4">
  {#if addresses.length === 0}
    <p class="text-muted-foreground text-sm">No addresses on file. Add one below.</p>
  {/if}
  {#each addresses as addr}
    <Card.Root class="border rounded-lg p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-foreground">
            {addr.is_default ? "Principal" : (addr.label || "Address")}
          </h3>
          <div class="mt-2 text-sm text-muted-foreground whitespace-pre-line">
            {addr.recipient_name || displayName}
            {#if addr.street || addr.city}
              {"\n"}
              {addr.street ?? "—"}
              {#if addr.city || addr.state || addr.zip}
                {"\n"}
                {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
              {/if}
              {#if addr.country}
                {"\n"}
                {countryName(addr.country).toUpperCase()}
              {/if}
            {/if}
          </div>
        </div>
        <div class="flex shrink-0 gap-2">
          {#if !addr.is_default}
            <form
              method="POST"
              action="{pathname}?/setDefaultAddress"
              use:enhance={() => {
                return async () => {
                  await invalidateAll();
                };
              }}
              class="inline"
            >
              <input type="hidden" name="address_id" value={addr.id} />
              <Button type="submit" variant="default" size="sm">
                Primary Address
              </Button>
            </form>
          {:else}
            <Button variant="secondary" size="sm" disabled>
              Primary Address
            </Button>
          {/if}
          <Button type="button" variant="outline" size="sm" onclick={() => openEditModal(addr)}>
            Edit
          </Button>
        </div>
      </div>
    </Card.Root>
  {/each}

  <Button type="button" variant="outline" onclick={openAddModal}>
    Add New
  </Button>
</div>

<AddressFormModal
  bind:open={modalOpen}
  address={editingAddress}
  user={user}
  pathname={pathname}
  hasExistingAddresses={addresses.length > 0}
  onSuccess={afterModalSuccess}
/>
