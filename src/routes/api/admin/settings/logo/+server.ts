import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAdmin, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * POST /api/admin/settings/logo
 * Upload logo
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);
    const formData = await event.request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return errorResponse("Logo file is required", 400);
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Please upload PNG, JPG, or SVG", 400);
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return errorResponse("File size must be less than 2MB", 400);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("public")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return errorResponse(uploadError.message, 500);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("public").getPublicUrl(filePath);

    // Update settings
    const { data: existing } = await supabaseAdmin.from("settings").select("*").limit(1).single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("settings")
        .update({
          logo_url: publicUrl,
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
      const { data, error } = await supabaseAdmin
        .from("settings")
        .insert({
          logo_url: publicUrl,
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
    return errorResponse("Failed to upload logo", 500);
  }
};

/**
 * DELETE /api/admin/settings/logo
 * Remove logo
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    const { user } = await requireAdmin(event);

    // Get existing settings
    const { data: existing } = await supabaseAdmin.from("settings").select("*").limit(1).single();

    if (!existing) {
      return errorResponse("Settings not found", 404);
    }

    // Delete from storage if exists
    if (existing.logo_url) {
      const urlParts = existing.logo_url.split("/");
      const filePath = urlParts.slice(urlParts.indexOf("logos")).join("/");
      await supabaseAdmin.storage.from("public").remove([filePath]);
    }

    // Update settings
    const { data, error } = await supabaseAdmin
      .from("settings")
      .update({
        logo_url: null,
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
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to remove logo", 500);
  }
};

