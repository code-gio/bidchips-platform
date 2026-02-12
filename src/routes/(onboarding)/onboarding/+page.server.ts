import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate, setError, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { supabaseAdmin, getProfileOnboarding } from "$lib/server/auth.js";
import { processProfileWithAvatar } from "$lib/server/storage.js";
import { onboardingSchema } from "$lib/schemas/onboarding.js";

const FORM_ID = "onboarding-form";

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

  const initial = profile
    ? {
        display_name: profile.display_name ?? "",
        username: profile.username ?? "",
        tagline: profile.tagline ?? "",
        bio: profile.bio ?? "",
        language: profile.language ?? "en",
        time_zone: profile.time_zone ?? "UTC",
        country: profile.address_country ?? "US",
        birth_date: profile.birth_date ?? "",
        avatar_url: avatarUrlToPath(profile.avatar_url) || "",
      }
    : {
        display_name: "",
        username: "",
        tagline: "",
        bio: "",
        language: "en",
        time_zone: "UTC",
        country: "US",
        birth_date: "",
        avatar_url: "",
      };

  const profileForClient = profile
    ? await processProfileWithAvatar(supabaseAdmin, {
        display_name: profile.display_name ?? "",
        username: profile.username ?? "",
        tagline: profile.tagline ?? "",
        bio: profile.bio ?? "",
        language: profile.language ?? "en",
        time_zone: profile.time_zone ?? "UTC",
        country: profile.address_country ?? "US",
        birth_date: profile.birth_date ?? "",
        avatar_url: avatarUrlToPath(profile.avatar_url) || "",
      })
    : null;

  return {
    profile: profileForClient,
    form: await superValidate(initial, zod4(onboardingSchema), { id: FORM_ID }),
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
      tagline,
      bio,
      language,
      time_zone,
      country,
      birth_date,
      avatar_url,
    } = form.data;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();
    if (existing) {
      return setError(form, "username", "This username is already taken.");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        display_name: display_name || null,
        username,
        tagline: tagline || null,
        bio: bio || null,
        language: language || "en",
        time_zone,
        address_country: country || "US",
        birth_date: birth_date || null,
        avatar_url: avatar_url || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return fail(500, { form, message: error.message });
    }

    const redirectTo = url.searchParams.get("redirectTo");
    redirect(303, redirectTo && redirectTo.startsWith("/") ? redirectTo : "/");
  },
};
