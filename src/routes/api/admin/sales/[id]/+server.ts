import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/sales/:id
 * Get sale record details
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const saleId = getRouteParam(event, "id");

    if (!saleId) {
      return errorResponse("Sale ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("sales_records")
      .select("*")
      .eq("id", saleId)
      .single();

    if (error || !data) {
      return errorResponse("Sale record not found", 404);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get sale record", 500);
  }
};

/**
 * PUT /api/admin/sales/:id
 * Update sale record
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const saleId = getRouteParam(event, "id");
    const body = await parseBody<{
      shipping_name?: string;
      shipping_street?: string;
      shipping_city?: string;
      shipping_state?: string;
      shipping_zip?: string;
      shipping_country?: string;
      tracking_number?: string;
      admin_notes?: string;
      customer_notes?: string;
    }>(event);

    if (!saleId) {
      return errorResponse("Sale ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("sales_records")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: admin.id,
      user_name: admin.display_name || `${admin.first_name} ${admin.last_name}`,
      user_role: admin.role,
      action: "update_sale",
      resource: "sales_record",
      resource_id: saleId,
      description: `Updated sale record ${saleId}`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update sale record", 500);
  }
};

