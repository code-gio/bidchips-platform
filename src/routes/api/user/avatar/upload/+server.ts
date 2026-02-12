import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

const BUCKET = "avatars";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/**
 * POST /api/user/avatar/upload
 * Upload avatar image to storage, returns public URL.
 */
export const POST: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const formData = await event.request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || !(file instanceof File)) {
      return errorResponse("Avatar file is required", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse("Invalid file type. Use JPEG, PNG, GIF, or WebP", 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("File must be less than 5MB", 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}_avatar.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return errorResponse(uploadError.message, 500);
    }

    // Bucket is private: return path (stored in DB) and a signed URL for immediate display
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(fileName, 60 * 60); // 1 hour

    if (signedError || !signed?.signedUrl) {
      return successResponse({ path: fileName, url: "" });
    }

    return successResponse({ path: fileName, url: signed.signedUrl });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err) return err as Response;
    return errorResponse("Failed to upload avatar", 500);
  }
};
