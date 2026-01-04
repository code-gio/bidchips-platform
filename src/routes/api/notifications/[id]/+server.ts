import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getRouteParam, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const notificationId = getRouteParam(event, "id");

    if (!notificationId) {
      return errorResponse("Notification ID required", 400);
    }

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to delete notification", 500);
  }
};

