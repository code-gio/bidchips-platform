import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/lots/:id
 * Get lot for editing
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const lotId = getRouteParam(event, "id");

    if (!lotId) {
      return errorResponse("Lot ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("lots")
      .select("*")
      .eq("id", lotId)
      .single();

    if (error || !data) {
      return errorResponse("Lot not found", 404, "LOT_NOT_FOUND");
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get lot", 500);
  }
};

/**
 * PUT /api/admin/lots/:id
 * Update lot
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const lotId = getRouteParam(event, "id");
    const body = await parseBody<any>(event);

    if (!lotId) {
      return errorResponse("Lot ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("lots")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lotId)
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
      action: "update_lot",
      resource: "lot",
      resource_id: lotId,
      description: `Updated lot "${data.title}"`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update lot", 500);
  }
};

/**
 * DELETE /api/admin/lots/:id
 * Delete lot
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const lotId = getRouteParam(event, "id");

    if (!lotId) {
      return errorResponse("Lot ID required", 400);
    }

    // Check if lot has bids or sales records
    const { data: bids } = await supabaseAdmin
      .from("bids")
      .select("id")
      .eq("lot_id", lotId)
      .limit(1);

    if (bids && bids.length > 0) {
      return errorResponse("Cannot delete lot with existing bids", 400);
    }

    const { error } = await supabaseAdmin.from("lots").delete().eq("id", lotId);

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      user_name: user.display_name || `${user.first_name} ${user.last_name}`,
      user_role: user.role,
      action: "delete_lot",
      resource: "lot",
      resource_id: lotId,
      description: `Deleted lot`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse({ deleted: true });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to delete lot", 500);
  }
};

