import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/server/auth.js";

export const load: LayoutServerLoad = async ({
  parent,
  locals: { safeGetSession },
  url,
}) => {
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    redirect(303, "/sign-in?redirectTo=" + encodeURIComponent(url.pathname));
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("onboarding_completed, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.onboarding_completed !== true) {
    redirect(303, "/onboarding?redirectTo=" + encodeURIComponent(url.pathname));
  }

  if (profile.role === "admin") {
    redirect(303, "/admin");
  }

  const parentData = await parent();
  return {
    ...parentData,
    url: url.origin,
    role: profile.role,
  };
};
