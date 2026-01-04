import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET /api/settings
 * Get public site settings
 * Public endpoint
 */
export const GET: RequestHandler = async ({ locals }) => {
  const supabase = locals.supabase;

  const { data, error } = await supabase
    .from("settings")
    .select(
      "site_name, site_description, contact_email, support_email, logo_url, favicon_url, primary_color, terms_of_service_url, privacy_policy_url, company_name, company_street, company_city, company_state, company_zip, company_country"
    )
    .limit(1)
    .single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
};

