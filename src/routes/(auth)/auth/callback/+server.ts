import { redirect } from "@sveltejs/kit";
import { ensureUserFromAuth, getProfileOnboarding } from "$lib/server/auth.js";

export const GET = async (event) => {
  const {
    url,
    locals: { supabase },
  } = event;
  const code = url.searchParams.get("code") as string;
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureUserFromAuth(data.user);
      const { needsOnboarding } = await getProfileOnboarding(data.user.id);
      if (needsOnboarding) {
        throw redirect(303, "/onboarding");
      }
      throw redirect(303, next);
    }
  }

  throw redirect(303, "/auth/error");
};
