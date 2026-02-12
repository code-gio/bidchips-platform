import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/analytics/overview
 * Get analytics overview data
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);
    const range = params.get("range") || "30d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    // Previous period for comparison
    const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(startDate);

    // Get sales records for current period
    const { data: sales, error: salesError } = await supabaseAdmin
      .from("sales_records")
      .select("*")
      .eq("payment_status", "paid")
      .gte("created_at", startDateISO)
      .lte("created_at", endDateISO);

    if (salesError) {
      return errorResponse(salesError.message, 500);
    }

    // Get sales records for previous period
    const { data: prevSales } = await supabaseAdmin
      .from("sales_records")
      .select("*")
      .eq("payment_status", "paid")
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString());

    // Calculate metrics
    const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
    const prevRevenue = prevSales?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const saleCount = sales?.length || 0;
    const prevSaleCount = prevSales?.length || 0;
    const avgSalePrice = saleCount > 0 ? totalRevenue / saleCount : 0;
    const prevAvgSalePrice = prevSaleCount > 0 ? (prevRevenue / prevSaleCount) : 0;
    const avgPriceChange = prevAvgSalePrice > 0 ? ((avgSalePrice - prevAvgSalePrice) / prevAvgSalePrice) * 100 : 0;

    // Get bids for current period
    const { count: totalBids } = await supabaseAdmin
      .from("bids")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDateISO)
      .lte("created_at", endDateISO);

    const { count: prevBids } = await supabaseAdmin
      .from("bids")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString());

    const bidsChange = prevBids && prevBids > 0 ? ((totalBids - prevBids) / prevBids) * 100 : 0;

    // Calculate conversion rate (sales / bids)
    const conversionRate = totalBids && totalBids > 0 ? (saleCount / totalBids) * 100 : 0;
    const prevConversionRate = prevBids && prevBids > 0 ? (prevSaleCount / prevBids) * 100 : 0;
    const conversionChange = prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 : 0;

    // Get revenue data by day
    const revenueByDay = new Map<string, number>();
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      revenueByDay.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    sales?.forEach((sale) => {
      const dateKey = new Date(sale.created_at).toISOString().split("T")[0];
      const current = revenueByDay.get(dateKey) || 0;
      revenueByDay.set(dateKey, current + (sale.sale_price || 0));
    });

    const revenueData = Array.from(revenueByDay.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top lots by revenue
    const { data: topLotsData } = await supabaseAdmin
      .from("lots")
      .select(`
        id,
        title,
        thumbnail_url,
        sold_price,
        bid_count,
        winning_bidder_id,
        winning_bidder_name
      `)
      .eq("status", "sold")
      .not("sold_price", "is", null)
      .order("sold_price", { ascending: false })
      .limit(10);

    // Get user emails for winners
    const winnerIds = topLotsData?.filter((lot) => lot.winning_bidder_id).map((lot) => lot.winning_bidder_id) || [];
    const { data: winners } = winnerIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .in("id", winnerIds)
      : { data: null };

    const winnerMap = new Map(winners?.map((w: any) => [w.id, w.email]) || []);

    const topLots = topLotsData?.map((lot: any) => ({
      id: lot.id,
      title: lot.title,
      thumbnail_url: lot.thumbnail_url,
      final_price: lot.sold_price || 0,
      bid_count: lot.bid_count || 0,
      winner_name: lot.winning_bidder_name || null,
      winner_email: winnerMap.get(lot.winning_bidder_id) || null,
    })) || [];

    return successResponse({
      metrics: {
        total_revenue: totalRevenue,
        revenue_change: revenueChange,
        total_bids: totalBids || 0,
        bids_change: bidsChange,
        average_sale_price: avgSalePrice,
        avg_price_change: avgPriceChange,
        conversion_rate: conversionRate,
        conversion_change: conversionChange,
      },
      revenue_data: revenueData,
      top_lots: topLots,
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get analytics", 500);
  }
};

