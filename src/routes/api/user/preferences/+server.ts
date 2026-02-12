import { json, type RequestHandler } from "@sveltejs/kit";
import { requireAuth, parseBody, successResponse, errorResponse } from "$lib/server/api-helpers";
import { supabaseAdmin } from "$lib/server/auth";

/**
 * PUT /api/user/preferences
 * Update notification preferences
 */
export const PUT: RequestHandler = async (event) => {
  try {
    const { user } = await requireAuth(event);
    const body = await parseBody<{
      email_notify_outbid?: boolean;
      email_notify_won?: boolean;
      email_notify_ending_soon?: boolean;
      email_notify_offer_response?: boolean;
      email_notify_watchlist_starting?: boolean;
    }>(event);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    if (error.status) return error;
    return errorResponse("Failed to update preferences", 500);
  }
};

