export interface SalesRecord {
  id: string;
  lot_id: string;
  user_id: string;
  sale_type: 'auction_win' | 'offer_accepted';
  sale_price: number;
  lot_title: string;
  lot_mpn: string | null;
  user_name: string | null;
  user_email: string | null;
  shipping_name: string | null;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  payment_status: 'pending' | 'paid' | 'overdue';
  payment_received_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  shipping_status: 'pending' | 'shipped' | 'delivered';
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  customer_notes: string | null;
}


