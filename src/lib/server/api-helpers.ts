import { json, type RequestEvent } from "@sveltejs/kit";
import { supabaseAdmin } from "./auth";

// User type from database
interface User {
  id: string;
  auth_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_country: string;
  email_notify_outbid: boolean;
  email_notify_won: boolean;
  email_notify_ending_soon: boolean;
  email_notify_offer_response: boolean;
  email_notify_watchlist_starting: boolean;
  total_bids: number;
  total_wins: number;
  total_spent: number;
  role: "user" | "admin";
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

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

  // Get user record from database
  const { data: userRecord, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (error || !userRecord) {
    throw errorResponse("User not found", 404, "USER_NOT_FOUND");
  }

  if (!userRecord.is_active) {
    throw errorResponse("Account is inactive", 403, "ACCOUNT_INACTIVE");
  }

  if (userRecord.is_banned) {
    throw errorResponse("Account is banned", 403, "ACCOUNT_BANNED");
  }

  return { session, user: userRecord as User };
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

  const { data: userRecord } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  return userRecord?.id || null;
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

