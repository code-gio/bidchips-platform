import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots/:id
 * Get single lot details
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, params }) => {
  const supabase = locals.supabase;
  const lotId = params.id;

  if (!lotId) {
    return json({ success: false, error: "Lot ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return json({ success: false, error: "Lot not found" }, { status: 404 });
  }

  return json({ success: true, data });
};

