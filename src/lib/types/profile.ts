/** Row from public.profiles (id = auth.uid). Single table for all user data. */
export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  username: string | null;
  time_zone: string;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  /** Crop params for displaying the avatar (same as in crop editor) */
  avatar_crop_x?: number | null;
  avatar_crop_y?: number | null;
  avatar_crop_scale?: number | null;
  avatar_crop_size?: number | null;
  avatar_image_width?: number | null;
  avatar_image_height?: number | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  country: string | null;
  tagline: string | null;
  bio: string | null;
  language: string | null;
  birth_date: string | null;
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
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}
