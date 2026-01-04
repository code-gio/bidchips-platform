import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots
 * Get active lots with filters
 * Public endpoint - uses Supabase Direct (client-side with RLS)
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const params = url.searchParams;

  // Build query
  let query = supabase
    .from("lots")
    .select("*")
    .eq("status", "active")
    .order("end_time", { ascending: true });

  // Apply filters
  const categoryId = params.get("category_id");
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const search = params.get("search");
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,mpn.ilike.%${search}%,manufacturer.ilike.%${search}%`
    );
  }

  const minPrice = params.get("min_price");
  if (minPrice) {
    query = query.gte("current_price", parseFloat(minPrice));
  }

  const maxPrice = params.get("max_price");
  if (maxPrice) {
    query = query.lte("current_price", parseFloat(maxPrice));
  }

  const condition = params.get("condition");
  if (condition) {
    query = query.eq("condition", condition);
  }

  const featured = params.get("featured");
  if (featured === "true") {
    query = query.eq("featured_lot", true);
  }

  // Pagination
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "20");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  });
};

