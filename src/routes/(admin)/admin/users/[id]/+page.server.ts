import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { supabaseAdmin } from "$lib/server/auth.js";
import { processProfileWithAvatar } from "$lib/server/storage.js";
import type { ProfileAddress } from "$lib/types/profile-address.js";

const ADDRESSES_TABLE = "profile_addresses";

function syncDefaultAddressToProfile(profileId: string, addr: {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}) {
  return supabaseAdmin
    .from("profiles")
    .update({
      country: addr.country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);
}

export const load: PageServerLoad = async ({ params }) => {
  const id = params.id;
  if (!id) {
    redirect(303, "/admin/users");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    redirect(303, "/admin/users");
  }

  const user = await processProfileWithAvatar(supabaseAdmin, profile);
  if (!user) {
    redirect(303, "/admin/users");
  }

  const { data: addresses } = await supabaseAdmin
    .from(ADDRESSES_TABLE)
    .select("*")
    .eq("profile_id", id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  return {
    user,
    addresses: (addresses ?? []) as ProfileAddress[],
  };
};

export const actions: Actions = {
  createAddress: async (event) => {
    const { request, params } = event;
    const id = params.id;
    if (!id) return { success: false, error: "Missing user id" };

    const form = await request.formData();
    const recipient_name = (form.get("recipient_name") as string)?.trim() || null;
    const label = (form.get("label") as string)?.trim() || null;
    const street = (form.get("street") as string)?.trim() || null;
    const city = (form.get("city") as string)?.trim() || null;
    const state = (form.get("state") as string)?.trim() || null;
    const zip = (form.get("zip") as string)?.trim() || null;
    const country = (form.get("country") as string)?.trim() || "US";
    const is_first = form.get("is_first") === "true";

    const { data: existing } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .select("id")
      .eq("profile_id", id)
      .limit(1)
      .maybeSingle();

    const is_default = !existing || is_first;

    const { data: inserted, error } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .insert({
        profile_id: id,
        recipient_name,
        label,
        street,
        city,
        state,
        zip,
        country,
        is_default,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    if (is_default) {
      await syncDefaultAddressToProfile(id, {
        street,
        city,
        state,
        zip,
        country,
      });
    }

    return { success: true };
  },

  updateAddress: async (event) => {
    const { request, params } = event;
    const id = params.id;
    const addressId = (await request.formData()).get("address_id") as string;
    if (!id || !addressId) return { success: false, error: "Missing id" };

    const form = await request.formData();
    const recipient_name = (form.get("recipient_name") as string)?.trim() || null;
    const label = (form.get("label") as string)?.trim() || null;
    const street = (form.get("street") as string)?.trim() || null;
    const city = (form.get("city") as string)?.trim() || null;
    const state = (form.get("state") as string)?.trim() || null;
    const zip = (form.get("zip") as string)?.trim() || null;
    const country = (form.get("country") as string)?.trim() || "US";

    const { data: addr } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .select("is_default")
      .eq("id", addressId)
      .eq("profile_id", id)
      .single();

    if (!addr) return { success: false, error: "Address not found" };

    const { error } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .update({
        recipient_name,
        label,
        street,
        city,
        state,
        zip,
        country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .eq("profile_id", id);

    if (error) return { success: false, error: error.message };

    if (addr.is_default) {
      await syncDefaultAddressToProfile(id, {
        street,
        city,
        state,
        zip,
        country,
      });
    }

    return { success: true };
  },

  setDefaultAddress: async (event) => {
    const { request, params } = event;
    const id = params.id;
    const form = await request.formData();
    const addressId = form.get("address_id") as string;
    if (!id || !addressId) return { success: false, error: "Missing id" };

    const { data: addr, error: fetchErr } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .select("street, city, state, zip, country")
      .eq("id", addressId)
      .eq("profile_id", id)
      .single();

    if (fetchErr || !addr) return { success: false, error: "Address not found" };

    await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq("profile_id", id);

    await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .eq("profile_id", id);

    await syncDefaultAddressToProfile(id, {
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
    });

    return { success: true };
  },
};
