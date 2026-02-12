import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * POST /api/offers
 * Submit an offer on a lot
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const body = await parseBody<{
      lot_id: string;
      amount: number;
      message?: string;
    }>(event);

    if (!body.lot_id || !body.amount) {
      return errorResponse("lot_id and amount are required", 400);
    }

    // Get lot
    const { data: lot, error: lotError } = await supabaseAdmin
      .from("lots")
      .select("*")
      .eq("id", body.lot_id)
      .single();

    if (lotError || !lot) {
      return errorResponse("Lot not found", 404, "LOT_NOT_FOUND");
    }

    // Validate
    if (!lot.allow_offers) {
      return errorResponse("Offers are not allowed for this lot", 400, "OFFERS_NOT_ALLOWED");
    }

    if (lot.status !== "active") {
      return errorResponse("Lot is not active", 400, "LOT_NOT_ACTIVE");
    }

    if (lot.minimum_offer && body.amount < lot.minimum_offer) {
      return errorResponse(
        `Offer must be at least $${lot.minimum_offer.toFixed(2)}`,
        400,
        "OFFER_TOO_LOW"
      );
    }

    // Check for existing pending offer
    const { data: existingOffer } = await supabaseAdmin
      .from("offers")
      .select("id")
      .eq("lot_id", body.lot_id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existingOffer) {
      return errorResponse(
        "You already have a pending offer on this lot",
        400,
        "OFFER_ALREADY_EXISTS"
      );
    }

    // Create offer
    const { data, error } = await supabaseAdmin
      .from("offers")
      .insert({
        lot_id: body.lot_id,
        user_id: user.id,
        lot_title: lot.title,
        user_name: user.display_name || `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        amount: body.amount,
        message: body.message || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Create notification for admins
    const { data: admins } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        lot_id: body.lot_id,
        offer_id: data.id,
        type: "offer_received" as const,
        title: "New Offer Received",
        message: `${user.display_name || user.email} submitted an offer of $${body.amount} on "${lot.title}"`,
        action_url: `/admin/offers/${data.id}`,
      }));

      await supabaseAdmin.from("notifications").insert(notifications);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      user_name: user.display_name || `${user.first_name} ${user.last_name}`,
      user_role: user.role,
      action: "submit_offer",
      resource: "lot",
      resource_id: body.lot_id,
      description: `Submitted offer of $${body.amount} on "${lot.title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to submit offer", 500);
  }
};

