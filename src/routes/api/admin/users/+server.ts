import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/admin/users
 * Get all users
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);

    let query = event.locals.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const role = params.get("role");
    if (role) {
      query = query.eq("role", role);
    }

    const isBanned = params.get("is_banned");
    if (isBanned === "true") {
      query = query.eq("is_banned", true);
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
    return errorResponse("Failed to get users", 500);
  }
};

