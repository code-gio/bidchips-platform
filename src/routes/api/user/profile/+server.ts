import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/user/profile
 * Get current user profile
 */
export const GET: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);

    return successResponse(user);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get profile", 500);
  }
};

/**
 * PUT /api/user/profile
 * Update user profile
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const body = await parseBody<{
      first_name?: string;
      last_name?: string;
      display_name?: string;
      company?: string;
      phone?: string;
      avatar_url?: string;
    }>(event);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update profile", 500);
  }
};

