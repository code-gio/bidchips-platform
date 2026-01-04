/**
 * @deprecated Use SalesRecord instead
 * This file is kept for backward compatibility during migration
 */
export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method: 'stripe' | 'wire' | 'check' | 'cash' | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  shipping_name: string | null;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  shipping_status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  admin_notes: string | null;
  customer_notes: string | null;
}

/**
 * @deprecated Use SalesRecord instead
 */
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  lot_id: string;
  lot_title: string;
  mpn: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}
