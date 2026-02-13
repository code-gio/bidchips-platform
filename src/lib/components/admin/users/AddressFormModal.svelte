<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Field, FieldContent, FieldLabel } from "$lib/components/ui/field/index.js";
  import type { ProfileAddress } from "$lib/types/profile-address.js";
  import type { User } from "$lib/types/user.js";
  import { countries } from "$lib/data/countries.js";

  let {
    open = $bindable(false),
    address = null as ProfileAddress | null,
    user,
    pathname,
    hasExistingAddresses = false,
    onSuccess,
  }: {
    open?: boolean;
    address?: ProfileAddress | null;
    user: User;
    pathname: string;
    hasExistingAddresses?: boolean;
    onSuccess?: () => void;
  } = $props();

  const isEdit = $derived(!!address);
  const title = $derived(isEdit ? "Edit address" : "Add new address");
  const submitLabel = $derived(isEdit ? "Save" : "Add address");

  let recipient_name = $state("");
  let label = $state("");
  let street = $state("");
  let city = $state("");
  let stateOrProvince = $state("");
  let zip = $state("");
  let country = $state("US");

  $effect(() => {
    if (open) {
      if (address) {
        recipient_name = address.recipient_name ?? "";
        label = address.label ?? "";
        street = address.street ?? "";
        city = address.city ?? "";
        stateOrProvince = address.state ?? "";
        zip = address.zip ?? "";
        country = address.country ?? "US";
      } else {
        const name =
          user.display_name ||
          [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
          "";
        recipient_name = name;
        label = "";
        street = "";
        city = "";
        stateOrProvince = "";
        zip = "";
        country = "US";
      }
    }
  });

  async function handleClose() {
    open = false;
    await invalidateAll();
    onSuccess?.();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        {isEdit ? "Update this address." : "Add a new address for this user."}
      </Dialog.Description>
    </Dialog.Header>
    {#if isEdit}
      <form
        method="POST"
        action="{pathname}?/updateAddress"
        class="space-y-4"
        use:enhance={() => {
          return async ({ result }) => {
            if (result.type === "success" && (result.data as { success?: boolean })?.success) {
              await handleClose();
            }
          };
        }}
      >
        <input type="hidden" name="address_id" value={address?.id} />
        <Field>
          <FieldContent>
            <FieldLabel for="recipient_name">Recipient name</FieldLabel>
            <Input
              id="recipient_name"
              name="recipient_name"
              bind:value={recipient_name}
              placeholder="Full name"
              autocomplete="name"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <FieldLabel for="label">Label (optional)</FieldLabel>
            <Input
              id="label"
              name="label"
              bind:value={label}
              placeholder="e.g. Home, Work"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <FieldLabel for="street">Street</FieldLabel>
            <Input
              id="street"
              name="street"
              bind:value={street}
              placeholder="Street address"
              autocomplete="street-address"
            />
          </FieldContent>
        </Field>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldContent>
              <FieldLabel for="city">City</FieldLabel>
              <Input id="city" name="city" bind:value={city} placeholder="City" autocomplete="address-level2" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel for="state">State / Province</FieldLabel>
              <Input id="state" name="state" bind:value={stateOrProvince} placeholder="State" autocomplete="address-level1" />
            </FieldContent>
          </Field>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldContent>
              <FieldLabel for="zip">ZIP / Postal code</FieldLabel>
              <Input id="zip" name="zip" bind:value={zip} placeholder="ZIP" autocomplete="postal-code" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel for="country">Country</FieldLabel>
              <select
                id="country"
                name="country"
                bind:value={country}
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {#each countries as c}
                  <option value={c.code}>{c.country}</option>
                {/each}
              </select>
            </FieldContent>
          </Field>
        </div>
        <Dialog.Footer>
          <Button type="button" variant="outline" onclick={handleClose}>Cancel</Button>
          <Button type="submit">{submitLabel}</Button>
        </Dialog.Footer>
      </form>
    {:else}
      <form
        method="POST"
        action="{pathname}?/createAddress"
        class="space-y-4"
        use:enhance={() => {
          return async ({ result }) => {
            if (result.type === "success" && (result.data as { success?: boolean })?.success) {
              await handleClose();
            }
          };
        }}
      >
        <input type="hidden" name="is_first" value={hasExistingAddresses ? "false" : "true"} />
        <Field>
          <FieldContent>
            <FieldLabel for="recipient_name_new">Recipient name</FieldLabel>
            <Input
              id="recipient_name_new"
              name="recipient_name"
              bind:value={recipient_name}
              placeholder="Full name"
              autocomplete="name"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <FieldLabel for="label_new">Label (optional)</FieldLabel>
            <Input
              id="label_new"
              name="label"
              bind:value={label}
              placeholder="e.g. Home, Work"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldContent>
            <FieldLabel for="street_new">Street</FieldLabel>
            <Input
              id="street_new"
              name="street"
              bind:value={street}
              placeholder="Street address"
              autocomplete="street-address"
            />
          </FieldContent>
        </Field>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldContent>
              <FieldLabel for="city_new">City</FieldLabel>
              <Input id="city_new" name="city" bind:value={city} placeholder="City" autocomplete="address-level2" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel for="state_new">State / Province</FieldLabel>
              <Input id="state_new" name="state" bind:value={stateOrProvince} placeholder="State" autocomplete="address-level1" />
            </FieldContent>
          </Field>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldContent>
              <FieldLabel for="zip_new">ZIP / Postal code</FieldLabel>
              <Input id="zip_new" name="zip" bind:value={zip} placeholder="ZIP" autocomplete="postal-code" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel for="country_new">Country</FieldLabel>
              <select
                id="country_new"
                name="country"
                bind:value={country}
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {#each countries as c}
                  <option value={c.code}>{c.country}</option>
                {/each}
              </select>
            </FieldContent>
          </Field>
        </div>
        <Dialog.Footer>
          <Button type="button" variant="outline" onclick={handleClose}>Cancel</Button>
          <Button type="submit">{submitLabel}</Button>
        </Dialog.Footer>
      </form>
    {/if}
  </Dialog.Content>
</Dialog.Root>
