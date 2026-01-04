import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/users/:id/unban
 * Unban user
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const userId = getRouteParam(event, "id");

    if (!userId) {
      return errorResponse("User ID required", 400);
    }

    // Get user
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !targetUser) {
      return errorResponse("User not found", 404);
    }

    if (!targetUser.is_banned) {
      return errorResponse("User is not banned", 400, "USER_NOT_BANNED");
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        is_banned: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: admin.id,
      user_name: admin.display_name || `${admin.first_name} ${admin.last_name}`,
      user_role: admin.role,
      action: "unban_user",
      resource: "user",
      resource_id: userId,
      description: `Unbanned user ${targetUser.email}`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to unban user", 500);
  }
};

