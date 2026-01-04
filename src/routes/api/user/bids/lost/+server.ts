import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/user/bids/lost
 * Get user's lost auctions
 */
export const GET: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);

    const { data, error } = await event.locals.supabase
      .from("bids")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "lost")
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get lost bids", 500);
  }
};

