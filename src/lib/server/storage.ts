import type { SupabaseClient } from "@supabase/supabase-js";

const AVATARS_BUCKET = "avatars";
const SIGNED_URL_EXPIRY_SEC = 3600; // 1 hour

/**
 * Returns a signed URL for an avatar path (for private bucket).
 * If avatarPath is already an absolute URL (e.g. old public URL), returns it as-is.
 */
export async function getSignedAvatarUrl(
  supabase: SupabaseClient,
  avatarPath: string | null
): Promise<string | null> {
  if (!avatarPath?.trim()) return null;

  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .createSignedUrl(avatarPath, SIGNED_URL_EXPIRY_SEC);

  if (error) {
    console.error("Error creating signed avatar URL:", error);
    return null;
  }

  return data?.signedUrl ?? null;
}

/**
 * Replaces profile.avatar_url with a signed URL when it's a storage path.
 * Use when returning profile to the client so <img src={profile.avatar_url}> works with a private bucket.
 */
export async function processProfileWithAvatar<
  T extends { avatar_url?: string | null }
>(supabase: SupabaseClient, profile: T | null): Promise<T | null> {
  if (!profile || !profile.avatar_url) return profile;

  const signedUrl = await getSignedAvatarUrl(supabase, profile.avatar_url);

  return {
    ...profile,
    avatar_url: signedUrl ?? profile.avatar_url,
  };
}

/**
 * Same as processProfileWithAvatar for arrays (e.g. user lists).
 */
export async function processProfilesWithAvatars<
  T extends { avatar_url?: string | null }
>(supabase: SupabaseClient, profiles: T[]): Promise<T[]> {
  return Promise.all(
    profiles.map(async (profile) => {
      if (!profile.avatar_url || profile.avatar_url.startsWith("http")) {
        return profile;
      }
      const signedUrl = await getSignedAvatarUrl(supabase, profile.avatar_url);
      return {
        ...profile,
        avatar_url: signedUrl ?? profile.avatar_url,
      };
    })
  );
}
