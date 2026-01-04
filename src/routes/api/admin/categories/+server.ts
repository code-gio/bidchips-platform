import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/categories
 * Get all categories with lot counts
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);

    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Get lot counts for each category
    if (categories && categories.length > 0) {
      const categoryIds = categories.map((c) => c.id);
      
      // Get total lot counts
      const { data: lotCounts } = await supabaseAdmin
        .from("lots")
        .select("category_id")
        .in("category_id", categoryIds);

      // Get active lot counts
      const { data: activeLotCounts } = await supabaseAdmin
        .from("lots")
        .select("category_id")
        .in("category_id", categoryIds)
        .eq("status", "active");

      // Count lots per category
      const lotCountMap = new Map<string, number>();
      const activeLotCountMap = new Map<string, number>();

      lotCounts?.forEach((lot) => {
        if (lot.category_id) {
          lotCountMap.set(lot.category_id, (lotCountMap.get(lot.category_id) || 0) + 1);
        }
      });

      activeLotCounts?.forEach((lot) => {
        if (lot.category_id) {
          activeLotCountMap.set(lot.category_id, (activeLotCountMap.get(lot.category_id) || 0) + 1);
        }
      });

      // Add counts to categories
      const categoriesWithCounts = categories.map((category) => ({
        ...category,
        lot_count: lotCountMap.get(category.id) || 0,
        active_lot_count: activeLotCountMap.get(category.id) || 0,
      }));

      return successResponse(categoriesWithCounts);
    }

    return successResponse(categories || []);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get categories", 500);
  }
};

/**
 * POST /api/admin/categories
 * Create category
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const body = await parseBody<any>(event);

    if (!body.name) {
      return errorResponse("name is required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        ...body,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to create category", 500);
  }
};

