import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ updated: true });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to mark all as read", 500);
  }
};

