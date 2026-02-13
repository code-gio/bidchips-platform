import type { RequestHandler } from "@sveltejs/kit";
import { requireAuth, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";
import { processProfilesWithAvatars } from "$lib/server/storage";

/**
 * GET /api/admin/users
 * Get all users (any authenticated user with completed onboarding)
 */
export const GET: RequestHandler = async (event) => {
  try {
    // await requireAdmin(event);
    await requireAuth(event);
    const params = getQueryParams(event);

    let query = event.locals.supabase
      .from("profiles")
      .select("*")
    // .order("created_at", { ascending: false });

    // const role = params.get("role");
    // if (role) {
    //   query = query.eq("role", role);
    // }

    // const isBanned = params.get("is_banned");
    // if (isBanned === "true") {
    //   query = query.eq("is_banned", true);
    // }

    // Pagination
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    console.log(data)

    if (error) {
      return errorResponse(error.message, 500);
    }

    const dataWithSignedAvatars = await processProfilesWithAvatars(supabaseAdmin, data ?? []);

    return successResponse({
      data: dataWithSignedAvatars,
      pagination: { page, limit },
    });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get users", 500);
  }
};

