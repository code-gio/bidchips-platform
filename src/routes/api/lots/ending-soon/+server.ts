import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots/ending-soon
 * Get lots ending in next 24h
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const params = url.searchParams;

  const hours = parseInt(params.get("hours") || "24");
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("status", "active")
    .gte("end_time", now.toISOString())
    .lte("end_time", future.toISOString())
    .order("end_time", { ascending: true });

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
};

