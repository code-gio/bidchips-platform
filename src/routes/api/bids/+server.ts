import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * POST /api/bids
 * Place a bid on a lot
 * Edge Function - Complex server-side logic with transaction
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const body = await parseBody<{ lot_id: string; amount: number }>(event);

    if (!body.lot_id || !body.amount) {
      return errorResponse("lot_id and amount are required", 400);
    }

    // Get lot with lock (using admin client for transaction)
    const { data: lot, error: lotError } = await supabaseAdmin
      .from("lots")
      .select("*")
      .eq("id", body.lot_id)
      .single();

    if (lotError || !lot) {
      return errorResponse("Lot not found", 404, "LOT_NOT_FOUND");
    }

    // Validate lot status
    if (lot.status !== "active") {
      return errorResponse("Lot is not active", 400, "LOT_NOT_ACTIVE");
    }

    // Check if auction ended
    if (new Date(lot.end_time) <= new Date()) {
      return errorResponse("Auction has ended", 400, "AUCTION_ENDED");
    }

    // Check if user is already winning
    if (lot.winning_bidder_id === user.id) {
      return errorResponse("You are already the winning bidder", 400, "ALREADY_WINNING");
    }

    // Validate bid amount
    const minBid = lot.current_price + lot.bid_increment;
    if (body.amount < minBid) {
      return errorResponse(
        `Bid must be at least $${minBid.toFixed(2)} (current price + increment)`,
        400,
        "BID_TOO_LOW"
      );
    }

    // Check reserve price (warn but allow)
    const reserveMet = body.amount >= lot.reserve_price;

    // Start transaction - update lot and create bid
    const updates: any = {
      current_price: body.amount,
      bid_count: lot.bid_count + 1,
      winning_bidder_id: user.id,
      last_bid_time: new Date().toISOString(),
      reserve_met: reserveMet || lot.reserve_met,
    };

    // Check if extension needed
    const now = new Date();
    const endTime = new Date(lot.end_time);
    const timeRemaining = endTime.getTime() - now.getTime();
    const extensionWindow = 5 * 60 * 1000; // 5 minutes in ms
    const extensionTime = 10 * 60 * 1000; // 10 minutes in ms

    if (timeRemaining < extensionWindow && timeRemaining > 0) {
      const newEndTime = new Date(now.getTime() + extensionTime);
      updates.end_time = newEndTime.toISOString();
      updates.extended = true;
      updates.extension_count = (lot.extension_count || 0) + 1;
    }

    // Update lot
    const { data: updatedLot, error: updateError } = await supabaseAdmin
      .from("lots")
      .update(updates)
      .eq("id", body.lot_id)
      .select()
      .single();

    if (updateError) {
      return errorResponse(updateError.message, 500);
    }

    // Mark previous winning bid as outbid
    if (lot.winning_bidder_id) {
      await supabaseAdmin
        .from("bids")
        .update({ status: "outbid", is_winning: false })
        .eq("lot_id", body.lot_id)
        .eq("is_winning", true);

      // Create notification for previous winner
      if (lot.winning_bidder_id !== user.id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: lot.winning_bidder_id,
          lot_id: body.lot_id,
          type: "outbid",
          title: "You've been outbid",
          message: `Someone placed a higher bid on "${lot.title}"`,
          action_url: `/lots/${body.lot_id}`,
        });
      }
    }

    // Create new bid
    const { data: bid, error: bidError } = await supabaseAdmin
      .from("bids")
      .insert({
        lot_id: body.lot_id,
        user_id: user.id,
        user_name: user.display_name || `${user.first_name} ${user.last_name}`,
        amount: body.amount,
        is_winning: true,
        is_auto_bid: false,
        status: "active",
        ip_address: event.getClientAddress(),
        user_agent: event.request.headers.get("user-agent") || null,
      })
      .select()
      .single();

    if (bidError) {
      return errorResponse(bidError.message, 500);
    }

    // Update user stats
    await supabaseAdmin
      .from("users")
      .update({
        total_bids: (user.total_bids || 0) + 1,
      })
      .eq("id", user.id);

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      user_name: user.display_name || `${user.first_name} ${user.last_name}`,
      user_role: user.role,
      action: "place_bid",
      resource: "lot",
      resource_id: body.lot_id,
      description: `Placed bid of $${body.amount} on "${lot.title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse({
      bid,
      lot: updatedLot,
      reserve_warning: !reserveMet ? "Bid is below reserve price" : null,
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to place bid", 500);
  }
};

