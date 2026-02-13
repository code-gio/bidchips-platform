import type { RequestHandler } from "@sveltejs/kit";
import { requireAuth } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

const BUCKET = "avatars";
const EXPIRES_IN = 60 * 60; // 1 hour

/** Content-Type by file extension for avatars */
function contentTypeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/**
 * GET /api/user/avatar/signed?path=userId/filename.jpg
 * Proxies the avatar image (for private bucket). Returns the image bytes so the
 * client never hits Supabase, avoiding CORS/credentials issues (e.g. in fetch with credentials).
 * Path must be under the authenticated user's folder (userId/...).
 */
export const GET: RequestHandler = async (event) => {
  const { user } = await requireAuth(event);
  const rawPath = event.url.searchParams.get("path");
  if (!rawPath || typeof rawPath !== "string" || rawPath.includes("..")) {
    return new Response("Invalid path", { status: 400 });
  }
  const path = rawPath.split("?")[0];
  if (!path.startsWith(user.id + "/")) {
    return new Response("Forbidden", { status: 403 });
  }
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRES_IN);
  if (error || !data?.signedUrl) {
    return new Response("Not found", { status: 404 });
  }
  const imageRes = await fetch(data.signedUrl, { credentials: "omit" });
  if (!imageRes.ok) {
    return new Response("Not found", { status: 404 });
  }
  const blob = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get("content-type") ?? contentTypeFromPath(path);
  return new Response(blob, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "private, max-age=3600",
    },
  });
};
