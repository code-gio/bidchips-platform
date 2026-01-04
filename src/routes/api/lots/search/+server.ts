import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots/search
 * Full-text search lots
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const params = url.searchParams;

  const query = params.get("q");
  if (!query) {
    return json({ success: false, error: "Search query required" }, { status: 400 });
  }

  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "20");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Search in title, description, mpn, manufacturer, and keywords
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("status", "active")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,mpn.ilike.%${query}%,manufacturer.ilike.%${query}%`
    )
    .order("created_at", { ascending: false })
    .range(from, to);

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

