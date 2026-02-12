import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import { ensureUserFromAuth, getProfileOnboarding } from "$lib/server/auth.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/";

  const redirectTo = new URL(url);
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error && data.user) {
      await ensureUserFromAuth(data.user);
      const { needsOnboarding } = await getProfileOnboarding(data.user.id);
      redirectTo.searchParams.delete("next");
      if (needsOnboarding) {
        redirect(303, "/onboarding");
      }
      redirect(303, redirectTo.pathname + redirectTo.search);
    }
  }

  redirectTo.pathname = "/auth/error";
  redirect(303, redirectTo);
}