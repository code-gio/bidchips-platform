import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/sales/:id/ship
 * Mark sale as shipped
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user: admin } = await requireAdmin(event);
    const saleId = getRouteParam(event, "id");
    const body = await parseBody<{
      tracking_number?: string;
      carrier?: string;
      shipped_at?: string;
      admin_notes?: string;
    }>(event);

    if (!saleId) {
      return errorResponse("Sale ID required", 400);
    }

    // Get sale record
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales_records")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleError || !sale) {
      return errorResponse("Sale record not found", 404);
    }

    // Update sale record
    const { data, error } = await supabaseAdmin
      .from("sales_records")
      .update({
        shipping_status: "shipped",
        tracking_number: body.tracking_number || null,
        shipped_at: body.shipped_at || new Date().toISOString(),
        admin_notes: body.admin_notes || sale.admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Create notification for buyer
    await supabaseAdmin.from("notifications").insert({
      user_id: sale.user_id,
      lot_id: sale.lot_id,
      type: "payment_reminder",
      title: "Item Shipped",
      message: `Your item "${sale.lot_title}" has been shipped${body.tracking_number ? ` (Tracking: ${body.tracking_number})` : ""}`,
      action_url: `/won/${sale.lot_id}`,
    });

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: admin.id,
      user_name: admin.display_name || `${admin.first_name} ${admin.last_name}`,
      user_role: admin.role,
      action: "ship_sale",
      resource: "sales_record",
      resource_id: saleId,
      description: `Marked sale ${saleId} as shipped`,
      ip_address: event.getClientAddress(),
      user_agent: event.request.headers.get("user-agent") || null,
    });

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to mark sale as shipped", 500);
  }
};

