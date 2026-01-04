import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/admin/activity-log
 * Get activity log
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);

    let query = event.locals.supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false });

    const userId = params.get("user_id");
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const resource = params.get("resource");
    if (resource) {
      query = query.eq("resource", resource);
    }

    const resourceId = params.get("resource_id");
    if (resourceId) {
      query = query.eq("resource_id", resourceId);
    }

    const action = params.get("action");
    if (action) {
      query = query.ilike("action", `%${action}%`);
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
      data,
      pagination: { page, limit },
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get activity log", 500);
  }
};

