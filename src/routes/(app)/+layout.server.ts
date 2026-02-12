import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/server/auth.js";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession },
  url,
}) => {
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    redirect(303, "/sign-in?redirectTo=" + encodeURIComponent(url.pathname));
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile || profile.onboarding_completed !== true) {
    redirect(303, "/onboarding?redirectTo=" + encodeURIComponent(url.pathname));
  }

  return {
    url: url.origin,
  };
};
