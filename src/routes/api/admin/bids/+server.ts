import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/bids
 * Get all bids (admin only)
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);

    // Get bids with lot information
    let query = supabaseAdmin
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false });

    const status = params.get("status");
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const lotId = params.get("lot_id");
    if (lotId) {
      query = query.eq("lot_id", lotId);
    }

    const userId = params.get("user_id");
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const search = params.get("search");
    if (search) {
      query = query.ilike("user_name", `%${search}%`);
    }

    const startDate = params.get("start_date");
    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    const endDate = params.get("end_date");
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // Pagination
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "50");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      data: data || [],
      pagination: { page, limit },
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get bids", 500);
  }
};

