import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate, setError, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { supabaseAdmin, getProfileOnboarding } from "$lib/server/auth.js";
import { processProfileWithAvatar } from "$lib/server/storage.js";
import { onboardingSchema } from "$lib/schemas/onboarding.js";

const FORM_ID = "onboarding-form";
const ADDRESSES_TABLE = "profile_addresses";

/** Normalize storage URL to path for private bucket (store path in DB, use signed URL to display) */
function avatarUrlToPath(url: string | null | undefined): string {
  if (!url || !url.includes("/avatars/")) return url ?? "";
  const m = url.match(/\/avatars\/(.+)$/);
  return m ? m[1] : url;
}

export const load: PageServerLoad = async ({
  locals: { safeGetSession },
}) => {
  const { session, user } = await safeGetSession();
  if (!session || !user) {
    redirect(303, "/sign-in?redirectTo=/onboarding");
  }

  const { needsOnboarding, profile } = await getProfileOnboarding(user.id);
  // if (!needsOnboarding && profile) {
  //   redirect(303, "/");
  // }

  const defaultAddress = await supabaseAdmin
    .from(ADDRESSES_TABLE)
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .maybeSingle()
    .then((r) => r.data);

  // Address fields come only from profile_addresses (default address). Never from profiles.
  const addressInitial = defaultAddress
    ? {
      country: defaultAddress.country ?? "us",
      address_street: defaultAddress.street ?? "",
      address_city: defaultAddress.city ?? "",
      address_state: defaultAddress.state ?? "",
      address_zip: defaultAddress.zip ?? "",
    }
    : {
      country: "us",
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip: "",
    };

  const initial = profile
    ? {
      display_name: profile.display_name ?? "",
      username: profile.username ?? "",
      ...addressInitial,
      avatar_url: avatarUrlToPath(profile.avatar_url) || "",
      avatar_crop_x: profile.avatar_crop_x ?? null,
      avatar_crop_y: profile.avatar_crop_y ?? null,
      avatar_crop_scale: profile.avatar_crop_scale ?? null,
      avatar_crop_size: profile.avatar_crop_size ?? null,
      avatar_image_width: profile.avatar_image_width ?? null,
      avatar_image_height: profile.avatar_image_height ?? null,
    }
    : {
      display_name: "",
      username: "",
      ...addressInitial,
      avatar_url: "",
      avatar_crop_x: null,
      avatar_crop_y: null,
      avatar_crop_scale: null,
      avatar_crop_size: null,
      avatar_image_width: null,
      avatar_image_height: null,
    };


  const profileForClient = profile
    ? await processProfileWithAvatar(supabaseAdmin, {
      display_name: profile.display_name ?? "",
      username: profile.username ?? "",
      country: profile.country ?? "us",
      avatar_url: avatarUrlToPath(profile.avatar_url) || "",
      avatar_crop_x: profile.avatar_crop_x ?? null,
      avatar_crop_y: profile.avatar_crop_y ?? null,
      avatar_crop_scale: profile.avatar_crop_scale ?? null,
      avatar_crop_size: profile.avatar_crop_size ?? null,
      avatar_image_width: profile.avatar_image_width ?? null,
      avatar_image_height: profile.avatar_image_height ?? null,
      email: profile.email ?? "",
    })
    : null;

  const form = await superValidate(zod4(onboardingSchema), { id: FORM_ID });
  form.data = { ...form.data, ...initial };

  return {
    profile: profileForClient,
    form,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { locals: { safeGetSession }, url } = event;
    const { session, user } = await safeGetSession();
    if (!session || !user) {
      redirect(303, "/sign-in?redirectTo=/onboarding");
    }

    const form = await superValidate(event, zod4(onboardingSchema), {
      id: FORM_ID,
    });
    if (!form.valid) {
      return fail(400, { form, message: "Please check your input." });
    }

    const {
      display_name,
      username,
      country,
      address_street,
      address_city,
      address_state,
      address_zip,
      avatar_url,
      avatar_crop_x,
      avatar_crop_y,
      avatar_crop_scale,
      avatar_crop_size,
      avatar_image_width,
      avatar_image_height,
    } = form.data;

    if (username && username.trim() !== "") {
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();
      if (existing) {
        return setError(form, "username", "This username is already taken.");
      }
    }

    const { data: existingDefault } = await supabaseAdmin
      .from(ADDRESSES_TABLE)
      .select("id")
      .eq("profile_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    if (existingDefault) {
      await supabaseAdmin
        .from(ADDRESSES_TABLE)
        .update({
          recipient_name: display_name || null,
          street: address_street || null,
          city: address_city || null,
          state: address_state || null,
          zip: address_zip || null,
          country: country || "US",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDefault.id)
        .eq("profile_id", user.id);
    } else {
      await supabaseAdmin.from(ADDRESSES_TABLE).insert({
        profile_id: user.id,
        recipient_name: display_name || null,
        is_default: true,
        street: address_street || null,
        city: address_city || null,
        state: address_state || null,
        zip: address_zip || null,
        country: country || "US",
      });
    }

    // Addresses live in profile_addresses; only country is stored in profiles.
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        display_name: display_name || null,
        username: username || null,
        country: country || "US",
        avatar_url: avatar_url || null,
        avatar_crop_x: avatar_crop_x ?? null,
        avatar_crop_y: avatar_crop_y ?? null,
        avatar_crop_scale: avatar_crop_scale ?? null,
        avatar_crop_size: avatar_crop_size ?? null,
        avatar_image_width: avatar_image_width ?? null,
        avatar_image_height: avatar_image_height ?? null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return fail(500, { form, message: error.message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect(303, "/admin");
    }

    const redirectTo = url.searchParams.get("redirectTo");
    redirect(303, redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
  },
};
