import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getQueryParams, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/admin/sales
 * Get all sales records
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const params = getQueryParams(event);

    let query = event.locals.supabase
      .from("sales_records")
      .select("*")
      .order("created_at", { ascending: false });

    const paymentStatus = params.get("payment_status");
    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }

    const shippingStatus = params.get("shipping_status");
    if (shippingStatus) {
      query = query.eq("shipping_status", shippingStatus);
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
    return errorResponse("Failed to get sales records", 500);
  }
};

