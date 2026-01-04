export interface Offer {
  id: string;
  lot_id: string;
  user_id: string;
  lot_title: string | null;
  user_name: string | null;
  user_email: string | null;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
  admin_response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  counter_amount: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

