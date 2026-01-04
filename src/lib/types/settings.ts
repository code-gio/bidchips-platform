export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string | null;
  contact_email: string | null;
  support_email: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  default_bid_increment: number;
  minimum_bid_increment: number;
  extension_time: number;
  extension_window: number;
  send_email_notifications: boolean;
  email_provider: 'sendgrid' | 'mailgun' | 'resend' | null;
  tax_rate: number;
  allow_offers: boolean;
  require_email_verification: boolean;
  company_name: string | null;
  company_street: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  company_country: string | null;
  terms_of_service_url: string | null;
  privacy_policy_url: string | null;
  updated_at: string;
  updated_by: string | null;
}

