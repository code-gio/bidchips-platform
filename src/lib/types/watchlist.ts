export interface WatchlistItem {
  id: string;
  user_id: string;
  lot_id: string;
  lot_title: string | null;
  lot_thumbnail: string | null;
  lot_current_price: number | null;
  lot_end_time: string | null;
  lot_status: string | null;
  notify_on_outbid: boolean;
  notify_on_ending: boolean;
  notified_ending: boolean;
  created_at: string;
  updated_at: string;
}

