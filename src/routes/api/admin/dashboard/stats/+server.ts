import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Execute parallel queries
    const [
      totalUsers,
      activeUsers30d,
      totalLots,
      activeLots,
      lotsWithBids,
      revenue30d,
      pendingSales,
      pendingOffers,
      avgSalePrice30d,
    ] = await Promise.all([
      // Total users
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      // Active users (last 30 days)
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_login_at", thirtyDaysAgo.toISOString()),
      // Total lots
      supabaseAdmin.from("lots").select("id", { count: "exact", head: true }),
      // Active lots
      supabaseAdmin
        .from("lots")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      // Lots with bids
      supabaseAdmin
        .from("lots")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("bid_count", 0),
      // Revenue last 30 days (from sales records)
      supabaseAdmin
        .from("sales_records")
        .select("sale_price")
        .eq("payment_status", "paid")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      // Pending sales
      supabaseAdmin
        .from("sales_records")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "pending"),
      // Pending offers
      supabaseAdmin
        .from("offers")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      // Average sale price last 30 days
      supabaseAdmin
        .from("lots")
        .select("sold_price")
        .eq("status", "sold")
        .gte("sold_at", thirtyDaysAgo.toISOString())
        .not("sold_price", "is", null),
    ]);

    const revenue = revenue30d.data?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
    const avgPrice =
      avgSalePrice30d.data && avgSalePrice30d.data.length > 0
        ? avgSalePrice30d.data.reduce((sum, lot) => sum + (lot.sold_price || 0), 0) /
          avgSalePrice30d.data.length
        : 0;

    // Calculate conversion rate (bids to wins)
    const { data: totalBids } = await supabaseAdmin
      .from("bids")
      .select("id", { count: "exact", head: true });
    const { data: wonBids } = await supabaseAdmin
      .from("bids")
      .select("id", { count: "exact", head: true })
      .eq("status", "won");
    const conversionRate =
      totalBids && totalBids.length > 0 ? (wonBids?.length || 0) / totalBids.length : 0;

    return successResponse({
      total_users: totalUsers.count || 0,
      active_users_30d: activeUsers30d.count || 0,
      total_lots: totalLots.count || 0,
      active_lots: activeLots.count || 0,
      lots_with_bids: lotsWithBids.count || 0,
      total_revenue_30d: revenue,
      pending_sales: pendingSales.count || 0,
      pending_offers: pendingOffers.count || 0,
      avg_sale_price_30d: avgPrice,
      conversion_rate: conversionRate,
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get dashboard stats", 500);
  }
};

