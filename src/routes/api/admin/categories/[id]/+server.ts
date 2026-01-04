import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, getRouteParam, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/admin/categories/:id
 * Update category
 */
export const PUT: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const categoryId = getRouteParam(event, "id");
    const body = await parseBody<any>(event);

    if (!categoryId) {
      return errorResponse("Category ID required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update category", 500);
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Delete category
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const categoryId = getRouteParam(event, "id");

    if (!categoryId) {
      return errorResponse("Category ID required", 400);
    }

    // Check if category is in use
    const { data: lots } = await supabaseAdmin
      .from("lots")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1);

    if (lots && lots.length > 0) {
      return errorResponse("Category is in use and cannot be deleted", 400, "CATEGORY_IN_USE");
    }

    const { error } = await supabaseAdmin.from("categories").delete().eq("id", categoryId);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to delete category", 500);
  }
};

