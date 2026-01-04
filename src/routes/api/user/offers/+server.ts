import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/user/offers
 * Get user's all offers
 */
export const GET: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const params = getQueryParams(event);

    let query = event.locals.supabase
      .from("offers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const status = params.get("status");
    if (status) {
      query = query.eq("status", status);
    }

    // Pagination
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      data,
      pagination: { page, limit },
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get offers", 500);
  }
};

