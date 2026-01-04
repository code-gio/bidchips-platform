export interface Bid {
  id: string;
  lot_id: string;
  user_id: string;
  user_name: string | null;
  amount: number;
  is_winning: boolean;
  is_auto_bid: boolean;
  ip_address: string | null;
  user_agent: string | null;
  status: 'active' | 'outbid' | 'won' | 'lost';
  created_at: string;
}

