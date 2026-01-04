import { json, type RequestHandler } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * POST /api/lots/:id/view
 * Increment view count
 * Public endpoint (no auth required)
 */
export const POST: RequestHandler = async ({ params }) => {
  const lotId = params.id;

  if (!lotId) {
    return json({ success: false, error: "Lot ID required" }, { status: 400 });
  }

  // Increment view count atomically
  const { data, error } = await supabaseAdmin.rpc("increment_lot_views", {
    lot_id: lotId,
  });

  if (error) {
    // If RPC doesn't exist, fall back to update
    const { error: updateError } = await supabaseAdmin
      .from("lots")
      .update({ view_count: supabaseAdmin.raw("view_count + 1") })
      .eq("id", lotId);

    if (updateError) {
      return json({ success: false, error: updateError.message }, { status: 500 });
    }
  }

  return json({ success: true });
};

