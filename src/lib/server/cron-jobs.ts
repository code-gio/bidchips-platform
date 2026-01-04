/**
 * Cron Job Functions
 * 
 * These functions should be called by a scheduled task runner (e.g., Vercel Cron, GitHub Actions, etc.)
 * or set up as Supabase Edge Functions with scheduled triggers.
 * 
 * To use with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/close-auctions",
 *       "schedule": "* * * * *"
 *     },
 *     {
 *       "path": "/api/cron/ending-soon-notifications",
 *       "schedule": "*/5 * * * *"
 *     }
 *   ]
 * }
 */

import { supabaseAdmin } from "./auth";

/**
 * Close expired auctions
 * Schedule: Every 1 minute
 */
export async function closeAuctions() {
  const now = new Date().toISOString();

  // Find all active lots that have ended
  const { data: expiredLots, error } = await supabaseAdmin
    .from("lots")
    .select("*")
    .eq("status", "active")
    .lte("end_time", now);

  if (error) {
    console.error("Error fetching expired lots:", error);
    return { success: false, error: error.message };
  }

  if (!expiredLots || expiredLots.length === 0) {
    return { success: true, closed: 0 };
  }

  let closedCount = 0;

  for (const lot of expiredLots) {
    try {
      if (lot.bid_count > 0 && lot.reserve_met) {
        // Lot sold
        await supabaseAdmin
          .from("lots")
          .update({
            status: "sold",
            sold_at: now,
            sold_to: lot.winning_bidder_id,
            sold_price: lot.current_price,
          })
          .eq("id", lot.id);

        // Mark winning bid as won
        await supabaseAdmin
          .from("bids")
          .update({ status: "won" })
          .eq("lot_id", lot.id)
          .eq("is_winning", true);

        // Mark other bids as lost
        await supabaseAdmin
          .from("bids")
          .update({ status: "lost", is_winning: false })
          .eq("lot_id", lot.id)
          .eq("status", "active")
          .neq("is_winning", true);

        // Create sales record
        const { data: saleRecord } = await supabaseAdmin
          .from("sales_records")
          .insert({
            lot_id: lot.id,
            user_id: lot.winning_bidder_id!,
            sale_type: "auction_win",
            sale_price: lot.current_price,
            lot_title: lot.title,
            lot_mpn: lot.mpn,
            user_name: lot.winning_bidder_name,
            payment_status: "pending",
            shipping_status: "pending",
          })
          .select()
          .single();

        // Create notification for winner
        if (lot.winning_bidder_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: lot.winning_bidder_id,
            lot_id: lot.id,
            type: "won",
            title: "You Won!",
            message: `Congratulations! You won "${lot.title}" for $${lot.current_price.toFixed(2)}`,
            action_url: `/won/${lot.id}`,
          });

          // Update user stats
          const { data: winner } = await supabaseAdmin
            .from("users")
            .select("total_wins, total_spent")
            .eq("id", lot.winning_bidder_id)
            .single();

          if (winner) {
            await supabaseAdmin
              .from("users")
              .update({
                total_wins: (winner.total_wins || 0) + 1,
                total_spent: (winner.total_spent || 0) + lot.current_price,
              })
              .eq("id", lot.winning_bidder_id);
          }
        }
      } else {
        // Lot unsold
        await supabaseAdmin
          .from("lots")
          .update({ status: "unsold" })
          .eq("id", lot.id);

        // Mark all bids as lost
        await supabaseAdmin
          .from("bids")
          .update({ status: "lost", is_winning: false })
          .eq("lot_id", lot.id)
          .eq("status", "active");
      }

      closedCount++;
    } catch (error) {
      console.error(`Error closing lot ${lot.id}:`, error);
    }
  }

  return { success: true, closed: closedCount };
}

/**
 * Send ending soon notifications
 * Schedule: Every 5 minutes
 */
export async function sendEndingSoonNotifications() {
  const now = new Date();
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

  // Find lots ending in next 10 minutes
  const { data: endingLots, error } = await supabaseAdmin
    .from("lots")
    .select("*")
    .eq("status", "active")
    .gte("end_time", now.toISOString())
    .lte("end_time", tenMinutesFromNow.toISOString());

  if (error) {
    console.error("Error fetching ending lots:", error);
    return { success: false, error: error.message };
  }

  if (!endingLots || endingLots.length === 0) {
    return { success: true, notified: 0 };
  }

  let notifiedCount = 0;

  for (const lot of endingLots) {
    try {
      // Get watchers with notify_on_ending = true
      const { data: watchers } = await supabaseAdmin
        .from("watchlist")
        .select("user_id")
        .eq("lot_id", lot.id)
        .eq("notify_on_ending", true)
        .eq("notified_ending", false);

      // Get bidders on this lot
      const { data: bidders } = await supabaseAdmin
        .from("bids")
        .select("user_id")
        .eq("lot_id", lot.id)
        .eq("status", "active");

      const userIds = new Set<string>();
      watchers?.forEach((w) => userIds.add(w.user_id));
      bidders?.forEach((b) => userIds.add(b.user_id));

      if (userIds.size > 0) {
        const notifications = Array.from(userIds).map((userId) => ({
          user_id: userId,
          lot_id: lot.id,
          type: "ending_soon" as const,
          title: "Auction Ending Soon",
          message: `"${lot.title}" is ending in less than 10 minutes!`,
          action_url: `/lots/${lot.id}`,
        }));

        await supabaseAdmin.from("notifications").insert(notifications);

        // Mark watchlist items as notified
        if (watchers && watchers.length > 0) {
          await supabaseAdmin
            .from("watchlist")
            .update({ notified_ending: true })
            .eq("lot_id", lot.id)
            .eq("notify_on_ending", true);
        }

        notifiedCount += userIds.size;
      }
    } catch (error) {
      console.error(`Error sending notifications for lot ${lot.id}:`, error);
    }
  }

  return { success: true, notified: notifiedCount };
}

