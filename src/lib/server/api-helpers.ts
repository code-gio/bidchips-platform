import { json, type RequestEvent } from "@sveltejs/kit";
import type { User } from "$lib/types/user.js";
import { supabaseAdmin } from "./auth";

/**
 * API Response Helpers
 */
export function successResponse<T>(data: T, status = 200) {
  return json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  );
}

/**
 * Authentication Helpers
 */
export async function requireAuth(event: RequestEvent) {
  const { session, user } = await event.locals.safeGetSession();

  if (!session || !user) {
    throw errorResponse("Authentication required", 401, "AUTH_REQUIRED");
  }

  // Get profile (single user table) by auth id
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw errorResponse("User not found", 404, "USER_NOT_FOUND");
  }

  if (!profile.is_active) {
    throw errorResponse("Account is inactive", 403, "ACCOUNT_INACTIVE");
  }

  if (profile.is_banned) {
    throw errorResponse("Account is banned", 403, "ACCOUNT_BANNED");
  }

  return { session, user: profile as User };
}

export async function requireAdmin(event: RequestEvent) {
  const { user } = await requireAuth(event);

  if (user.role !== "admin") {
    throw errorResponse("Admin access required", 403, "ADMIN_REQUIRED");
  }

  return { user };
}

/**
 * Get user ID from session
 */
export async function getUserId(event: RequestEvent): Promise<string | null> {
  const { user } = await event.locals.safeGetSession();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  return profile?.id || null;
}

/**
 * Parse request body with error handling
 */
export async function parseBody<T>(event: RequestEvent): Promise<T> {
  try {
    return await event.request.json();
  } catch (error) {
    throw errorResponse("Invalid JSON body", 400, "INVALID_JSON");
  }
}

/**
 * Get query parameters
 */
export function getQueryParams(event: RequestEvent) {
  return event.url.searchParams;
}

/**
 * Get route parameter
 */
export function getRouteParam(event: RequestEvent, param: string): string | null {
  return (event.params as Record<string, string>)?.[param] || null;
}

