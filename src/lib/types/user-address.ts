export interface UserAddress {
  id: string;
  user_id: string;
  label: string | null;
  is_default: boolean;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}
