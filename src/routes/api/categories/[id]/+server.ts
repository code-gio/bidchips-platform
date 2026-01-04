import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/categories/:id
 * Get single category
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, params }) => {
  const supabase = locals.supabase;
  const categoryId = params.id;

  if (!categoryId) {
    return json({ success: false, error: "Category ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .eq("is_active", true)
    .single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return json({ success: false, error: "Category not found" }, { status: 404 });
  }

  return json({ success: true, data });
};

