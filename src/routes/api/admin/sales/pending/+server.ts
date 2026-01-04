import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, successResponse, errorResponse } from "$lib/server/api-helpers";

/**
 * GET /api/admin/sales/pending
 * Get pending payment sales
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);

    const { data, error } = await event.locals.supabase
      .from("sales_records")
      .select("*")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get pending sales", 500);
  }
};

