/** Row from public.profile_addresses (multiple addresses per profile). */
export interface ProfileAddress {
  id: string;
  profile_id: string;
  recipient_name: string | null;
  label: string | null;
  is_default: boolean;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
}
