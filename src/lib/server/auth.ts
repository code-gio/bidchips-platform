import { createClient } from "@supabase/supabase-js";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { Profile } from "$lib/types/profile.js";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";
import { SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private";

/**
 * Supabase Admin Client for server-side auth operations
 *
 * This client uses the service role key and bypasses Row Level Security (RLS).
 * Use this only for server-side operations that require admin privileges,
 * such as checking username uniqueness or updating user profiles.
 *
 * ⚠️ NEVER expose this client to the client-side code.
 */
export const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/** Profile row from public.profiles (id = auth.uid) */
export type ProfileRow = Profile;

/**
 * Ensure a row exists in public.profiles for this auth user.
 * Syncs from auth user. Call after sign-in/callback.
 */
export async function ensureUserFromAuth(authUser: AuthUser): Promise<void> {
  const meta = authUser.user_metadata || {};
  const firstName = meta.first_name ?? null;
  const lastName = meta.last_name ?? null;
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || authUser.email || "";

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: authUser.id,
      email: authUser.email ?? "",
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      username: null,
      time_zone: "UTC",
      company: null,
      phone: null,
      avatar_url: null,
      address_street: null,
      address_city: null,
      address_state: null,
      address_zip: null,
      country: "US",
      email_notify_outbid: true,
      email_notify_won: true,
      email_notify_ending_soon: true,
      email_notify_offer_response: true,
      email_notify_watchlist_starting: true,
      total_bids: 0,
      total_wins: 0,
      total_spent: 0,
      role: "user",
      is_active: true,
      is_banned: false,
      onboarding_completed: false,
      updated_at: now,
      last_login_at: now,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("ensureUserFromAuth:", error);
  }
}

/**
 * Get profile and whether onboarding is completed. Use after auth.
 */
export async function getProfileOnboarding(
  userId: string
): Promise<{ profile: ProfileRow | null; needsOnboarding: boolean }> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const needsOnboarding =
    !profile || (profile as ProfileRow).onboarding_completed === false;
  return { profile: profile as ProfileRow | null, needsOnboarding };
}

