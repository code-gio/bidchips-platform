import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/categories
 * Get all active categories
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals }) => {
  const supabase = locals.supabase;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
};

