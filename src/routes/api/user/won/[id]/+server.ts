import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/user/won/:id
 * Get won lot details
 */
export const GET: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const lotId = event.params.id;

    if (!lotId) {
      return errorResponse("Lot ID required", 400);
    }

    // Get lot - verify user won it
    const { data: lot, error: lotError } = await event.locals.supabase
      .from("lots")
      .select("*")
      .eq("id", lotId)
      .eq("sold_to", user.id)
      .eq("status", "sold")
      .single();

    if (lotError || !lot) {
      return errorResponse("Lot not found or you did not win this lot", 404);
    }

    // Get associated sale record if exists
    const { data: saleRecord } = await event.locals.supabase
      .from("sales_records")
      .select("*")
      .eq("lot_id", lotId)
      .eq("user_id", user.id)
      .single();

    return successResponse({
      lot,
      sale_record: saleRecord || null,
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get won lot", 500);
  }
};

