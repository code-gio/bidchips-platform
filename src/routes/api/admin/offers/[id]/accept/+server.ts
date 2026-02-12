import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/offers/:id/accept
 * Accept offer
 * Edge Function - Complex transaction
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const offerId = getRouteParam(event, "id");
    const body = await parseBody<{ admin_response?: string }>(event);

    if (!offerId) {
      return errorResponse("Offer ID required", 400);
    }

    // Get offer
    const { data: offer, error: offerError } = await supabaseAdmin
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (offerError || !offer) {
      return errorResponse("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    if (offer.status !== "pending") {
      return errorResponse("Only pending offers can be accepted", 400, "OFFER_NOT_PENDING");
    }

    // Get lot with lock
    const { data: lot, error: lotError } = await supabaseAdmin
      .from("lots")
      .select("*")
      .eq("id", offer.lot_id)
      .single();

    if (lotError || !lot) {
      return errorResponse("Lot not found", 404, "LOT_NOT_FOUND");
    }

    if (lot.status !== "active") {
      return errorResponse("Lot is not active", 400, "LOT_NOT_ACTIVE");
    }

    // Update offer
    const { data: updatedOffer, error: updateOfferError } = await supabaseAdmin
      .from("offers")
      .update({
        status: "accepted",
        responded_by: admin.id,
        responded_at: new Date().toISOString(),
        admin_response: body.admin_response || null,
      })
      .eq("id", offerId)
      .select()
      .single();

    if (updateOfferError) {
      return errorResponse(updateOfferError.message, 500);
    }

    // Update lot
    const { data: updatedLot, error: updateLotError } = await supabaseAdmin
      .from("lots")
      .update({
        status: "sold",
        sold_at: new Date().toISOString(),
        sold_to: offer.user_id,
        sold_price: offer.amount,
      })
      .eq("id", offer.lot_id)
      .select()
      .single();

    if (updateLotError) {
      return errorResponse(updateLotError.message, 500);
    }

    // Mark all other offers as rejected
    await supabaseAdmin
      .from("offers")
      .update({ status: "rejected" })
      .eq("lot_id", offer.lot_id)
      .eq("status", "pending");

    // Mark all bids as lost
    await supabaseAdmin
      .from("bids")
      .update({ status: "lost", is_winning: false })
      .eq("lot_id", offer.lot_id)
      .eq("status", "active");

    // Create sales record
    const { data: saleRecord, error: saleError } = await supabaseAdmin
      .from("sales_records")
      .insert({
        lot_id: offer.lot_id,
        user_id: offer.user_id,
        sale_type: "offer_accepted",
        sale_price: offer.amount,
        lot_title: offer.lot_title || lot.title,
        lot_mpn: lot.mpn,
        user_name: offer.user_name,
        user_email: offer.user_email,
        payment_status: "pending",
        shipping_status: "pending",
      })
      .select()
      .single();

    if (saleError) {
      return errorResponse(saleError.message, 500);
    }

    // Create notification for buyer
    await supabaseAdmin.from("notifications").insert({
      user_id: offer.user_id,
      lot_id: offer.lot_id,
      offer_id: offerId,
      type: "offer_accepted",
      title: "Offer Accepted",
      message: `Your offer of $${offer.amount} on "${offer.lot_title}" has been accepted`,
      action_url: `/won/${offer.lot_id}`,
    });

    // Get buyer user record
    const { data: buyer } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", offer.user_id)
      .single();

    if (buyer) {
      // Update buyer stats
      await supabaseAdmin
        .from("profiles")
        .update({
          total_wins: (buyer.total_wins || 0) + 1,
          total_spent: (buyer.total_spent || 0) + offer.amount,
        })
        .eq("id", offer.user_id);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: admin.id,
      user_name: admin.display_name || `${admin.first_name} ${admin.last_name}`,
      user_role: admin.role,
      action: "accept_offer",
      resource: "offer",
      resource_id: offerId,
      description: `Accepted offer of $${offer.amount} on "${offer.lot_title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse({ sale_record: saleRecord, offer: updatedOffer });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to accept offer", 500);
  }
};

