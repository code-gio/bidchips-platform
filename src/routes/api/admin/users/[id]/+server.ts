import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/users/:id
 * Get user details
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const userId = getRouteParam(event, "id");

    if (!userId) {
      return errorResponse("User ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return errorResponse("User not found", 404);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get user", 500);
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user
 */
export const PUT: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const userId = getRouteParam(event, "id");
    const body = await parseBody<any>(event);

    if (!userId) {
      return errorResponse("User ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update user", 500);
  }
};

