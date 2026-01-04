import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getRouteParam, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const notificationId = getRouteParam(event, "id");

    if (!notificationId) {
      return errorResponse("Notification ID required", 400);
    }

    // Verify ownership and update
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to mark notification as read", 500);
  }
};

