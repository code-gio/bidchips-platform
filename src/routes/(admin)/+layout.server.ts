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
    redirect(303, "/sign-in?redirectTo=/admin");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("onboarding_completed, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.onboarding_completed !== true) {
    redirect(303, "/onboarding?redirectTo=/admin");
  }

  // if (profile.role !== "admin") {
  //   redirect(303, "/");
  // }

  // Pasar los datos del layout raíz (session, user, profile, etc.) a las rutas admin
  const parentData = await parent();
  return { ...parentData };
};
