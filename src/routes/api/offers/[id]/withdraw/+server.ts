import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getRouteParam, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/offers/:id/withdraw
 * Withdraw an offer
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const offerId = getRouteParam(event, "id");

    if (!offerId) {
      return errorResponse("Offer ID required", 400);
    }

    // Get offer and verify ownership
    const { data: offer, error: offerError } = await supabaseAdmin
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .eq("user_id", user.id)
      .single();

    if (offerError || !offer) {
      return errorResponse("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    if (offer.status !== "pending") {
      return errorResponse("Only pending offers can be withdrawn", 400, "OFFER_NOT_PENDING");
    }

    // Update offer status
    const { data, error } = await supabaseAdmin
      .from("offers")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to withdraw offer", 500);
  }
};

