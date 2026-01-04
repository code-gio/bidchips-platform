import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/lots
 * Get all lots (including drafts)
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);

    let query = supabaseAdmin.from("lots").select("*").order("created_at", { ascending: false });

    const status = params.get("status");
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const search = params.get("search");
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,mpn.ilike.%${search}%,manufacturer.ilike.%${search}%`
      );
    }

    const categoryId = params.get("category_id");
    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
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
    return errorResponse("Failed to get lots", 500);
  }
};

/**
 * POST /api/admin/lots
 * Create new lot
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const body = await parseBody<any>(event);

    // Validate required fields
    if (!body.title || !body.starting_price || !body.end_time) {
      return errorResponse("title, starting_price, and end_time are required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("lots")
      .insert({
        ...body,
        current_price: body.starting_price || body.starting_price,
        created_by: user.id,
        status: body.status || "draft",
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      user_name: user.display_name || `${user.first_name} ${user.last_name}`,
      user_role: user.role,
      action: "create_lot",
      resource: "lot",
      resource_id: data.id,
      description: `Created lot "${body.title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to create lot", 500);
  }
};

