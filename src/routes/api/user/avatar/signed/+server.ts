import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { requireAuth } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

const BUCKET = "avatars";
const EXPIRES_IN = 60 * 60; // 1 hour

/**
 * GET /api/user/avatar/signed?path=userId/filename.jpg
 * Redirects to a signed URL for the avatar (for private bucket).
 * Path must be under the authenticated user's folder (userId/...).
 */
export const GET: RequestHandler = async (event) => {
  const { user } = await requireAuth(event);
  const path = event.url.searchParams.get("path");
  if (!path || typeof path !== "string" || path.includes("..")) {
    return new Response("Invalid path", { status: 400 });
  }
  // Path must be userId/... so only the owner can view
  if (!path.startsWith(user.id + "/")) {
    return new Response("Forbidden", { status: 403 });
  }
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRES_IN);
  if (error || !data?.signedUrl) {
    return new Response("Not found", { status: 404 });
  }
  redirect(302, data.signedUrl);
};
