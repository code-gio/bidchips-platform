export interface User {
  id: string;
  auth_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_country: string;
  email_notify_outbid: boolean;
  email_notify_won: boolean;
  email_notify_ending_soon: boolean;
  email_notify_offer_response: boolean;
  email_notify_watchlist_starting: boolean;
  total_bids: number;
  total_wins: number;
  total_spent: number;
  role: 'user' | 'admin';
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

