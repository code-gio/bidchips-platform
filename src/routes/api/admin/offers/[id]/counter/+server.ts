import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/offers/:id/counter
 * Counter offer
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const offerId = getRouteParam(event, "id");
    const body = await parseBody<{ counter_amount: number; admin_response?: string }>(event);

    if (!offerId) {
      return errorResponse("Offer ID required", 400);
    }

    if (!body.counter_amount) {
      return errorResponse("counter_amount is required", 400);
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
      return errorResponse("Only pending offers can be countered", 400, "OFFER_NOT_PENDING");
    }

    // Update offer
    const { data, error } = await supabaseAdmin
      .from("offers")
      .update({
        status: "countered",
        counter_amount: body.counter_amount,
        responded_by: admin.id,
        responded_at: new Date().toISOString(),
        admin_response: body.admin_response || null,
      })
      .eq("id", offerId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Create notification for buyer
    await supabaseAdmin.from("notifications").insert({
      user_id: offer.user_id,
      lot_id: offer.lot_id,
      offer_id: offerId,
      type: "offer_countered",
      title: "Counter Offer",
      message: `Your offer on "${offer.lot_title}" has been countered with $${body.counter_amount}`,
      action_url: `/offers/${offerId}`,
    });

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: admin.id,
      user_name: admin.display_name || `${admin.first_name} ${admin.last_name}`,
      user_role: admin.role,
      action: "counter_offer",
      resource: "offer",
      resource_id: offerId,
      description: `Countered offer with $${body.counter_amount} on "${offer.lot_title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to counter offer", 500);
  }
};

