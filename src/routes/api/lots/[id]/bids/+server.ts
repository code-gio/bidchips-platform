import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/lots/:id/bids
 * Get bid history (if not hidden)
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals, params }) => {
  const supabase = locals.supabase;
  const lotId = params.id;

  if (!lotId) {
    return json({ success: false, error: "Lot ID required" }, { status: 400 });
  }

  // First check if bid history is hidden
  const { data: lot, error: lotError } = await supabase
    .from("lots")
    .select("hide_bid_history")
    .eq("id", lotId)
    .single();

  if (lotError || !lot) {
    return json({ success: false, error: "Lot not found" }, { status: 404 });
  }

  if (lot.hide_bid_history) {
    return json({ success: true, data: [], message: "Bid history is hidden" });
  }

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("lot_id", lotId)
    .order("created_at", { ascending: false });

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
};

