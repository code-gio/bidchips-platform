export interface Notification {
  id: string;
  user_id: string;
  lot_id: string | null;
  offer_id: string | null;
  type: 'outbid' | 'won' | 'lost' | 'ending_soon' | 'offer_accepted' | 'offer_rejected' | 'offer_countered' | 'watchlist_starting' | 'payment_reminder' | 'auction_extended';
  title: string;
  message: string;
  action_url: string | null;
  action_text: string | null;
  read: boolean;
  email_sent: boolean;
  push_sent: boolean;
  created_at: string;
  read_at: string | null;
}

