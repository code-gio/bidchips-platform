import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/watchlist/:id
 * Update watchlist settings
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const watchlistId = getRouteParam(event, "id");
    const body = await parseBody<{
      notify_on_outbid?: boolean;
      notify_on_ending?: boolean;
    }>(event);

    if (!watchlistId) {
      return errorResponse("Watchlist ID required", 400);
    }

    // Verify ownership
    const { data: item, error: checkError } = await supabaseAdmin
      .from("watchlist")
      .select("id")
      .eq("id", watchlistId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !item) {
      return errorResponse("Watchlist item not found", 404, "WATCHLIST_ITEM_NOT_FOUND");
    }

    const { data, error } = await supabaseAdmin
      .from("watchlist")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", watchlistId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update watchlist", 500);
  }
};

/**
 * DELETE /api/watchlist/:id
 * Remove from watchlist
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const watchlistId = getRouteParam(event, "id");

    if (!watchlistId) {
      return errorResponse("Watchlist ID required", 400);
    }

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from("watchlist")
      .delete()
      .eq("id", watchlistId)
      .eq("user_id", user.id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to remove from watchlist", 500);
  }
};

