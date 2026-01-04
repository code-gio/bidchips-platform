import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots/featured
 * Get featured lots
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const params = url.searchParams;

  const limit = parseInt(params.get("limit") || "10");

  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("status", "active")
    .eq("featured_lot", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
};

