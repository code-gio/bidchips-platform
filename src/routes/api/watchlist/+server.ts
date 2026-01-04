import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * POST /api/watchlist
 * Add lot to watchlist
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const body = await parseBody<{
      lot_id: string;
      notify_on_outbid?: boolean;
      notify_on_ending?: boolean;
    }>(event);

    if (!body.lot_id) {
      return errorResponse("lot_id is required", 400);
    }

    // Check if lot exists
    const { data: lot, error: lotError } = await supabaseAdmin
      .from("lots")
      .select("id, title, thumbnail_url, current_price, end_time, status")
      .eq("id", body.lot_id)
      .single();

    if (lotError || !lot) {
      return errorResponse("Lot not found", 404, "LOT_NOT_FOUND");
    }

    // Check if already in watchlist
    const { data: existing } = await supabaseAdmin
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("lot_id", body.lot_id)
      .single();

    if (existing) {
      return errorResponse("Lot is already in your watchlist", 400, "ALREADY_IN_WATCHLIST");
    }

    // Add to watchlist
    const { data, error } = await supabaseAdmin
      .from("watchlist")
      .insert({
        user_id: user.id,
        lot_id: body.lot_id,
        lot_title: lot.title,
        lot_thumbnail: lot.thumbnail_url,
        lot_current_price: lot.current_price,
        lot_end_time: lot.end_time,
        lot_status: lot.status,
        notify_on_outbid: body.notify_on_outbid ?? false,
        notify_on_ending: body.notify_on_ending ?? true,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to add to watchlist", 500);
  }
};

