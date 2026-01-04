import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * GET /api/admin/settings
 * Get all settings
 */
export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);

    const { data, error } = await supabaseAdmin.from("settings").select("*").limit(1).single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to get settings", 500);
  }
};

/**
 * PUT /api/admin/settings
 * Update settings
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const body = await parseBody<any>(event);

    // Get existing settings
    const { data: existing } = await supabaseAdmin.from("settings").select("*").limit(1).single();

    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("settings")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return errorResponse(error.message, 500);
      }

      return successResponse(data);
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from("settings")
        .insert({
          ...body,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return errorResponse(error.message, 500);
      }

      return successResponse(data);
    }
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update settings", 500);
  }
};

