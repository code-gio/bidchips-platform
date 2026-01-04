import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/categories/:id/lots
 * Get lots in category
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, params, url }) => {
  const supabase = locals.supabase;
  const categoryId = params.id;
  const queryParams = url.searchParams;

  if (!categoryId) {
    return json({ success: false, error: "Category ID required" }, { status: 400 });
  }

  let query = supabase
    .from("lots")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "active")
    .order("end_time", { ascending: true });

  // Pagination
  const page = parseInt(queryParams.get("page") || "1");
  const limit = parseInt(queryParams.get("limit") || "20");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({
    success: true,
    data,
    pagination: {
      page,
      limit,
    },
  });
};

