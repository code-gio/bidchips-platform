import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/user/won
 * Get user's won lots
 */
export const GET: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const params = getQueryParams(event);

    // Get lots where user won
    let query = event.locals.supabase
      .from("lots")
      .select("*")
      .eq("sold_to", user.id)
      .eq("status", "sold")
      .order("sold_at", { ascending: false });

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
    return errorResponse("Failed to get won lots", 500);
  }
};

