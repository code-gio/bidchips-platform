import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/users/:id/ban
 * Ban user
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const userId = getRouteParam(event, "id");
    const body = await parseBody<{ reason?: string }>(event);

    if (!userId) {
      return errorResponse("User ID required", 400);
    }

    if (!body.reason || !body.reason.trim()) {
      return errorResponse("Ban reason is required", 400);
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

    if (targetUser.is_banned) {
      return errorResponse("User is already banned", 400, "USER_ALREADY_BANNED");
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        is_banned: true,
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
      action: "ban_user",
      resource: "user",
      resource_id: userId,
      description: `Banned user ${targetUser.email}. Reason: ${body.reason}`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to ban user", 500);
  }
};

