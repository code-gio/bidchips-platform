// ============================================
// Database Types
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'auth_id'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id'>>
      }
      lots: {
        Row: Lot
        Insert: Omit<Lot, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lot, 'id'>>
      }
      bids: {
        Row: Bid
        Insert: Omit<Bid, 'id' | 'created_at'>
        Update: Partial<Omit<Bid, 'id' | 'lot_id' | 'user_id'>>
      }
      offers: {
        Row: Offer
        Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Offer, 'id'>>
      }
      watchlist: {
        Row: WatchlistItem
        Insert: Omit<WatchlistItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WatchlistItem, 'id'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Invoice, 'id'>>
      }
      invoice_items: {
        Row: InvoiceItem
        Insert: Omit<InvoiceItem, 'id' | 'created_at'>
        Update: Partial<Omit<InvoiceItem, 'id'>>
      }
      settings: {
        Row: SiteSettings
        Insert: Partial<SiteSettings>
        Update: Partial<Omit<SiteSettings, 'id'>>
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

export interface User {
  id: string
  auth_id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  company: string | null
  phone: string | null
  avatar_url: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_country: string
  email_notify_outbid: boolean
  email_notify_won: boolean
  email_notify_ending_soon: boolean
  email_notify_offer_response: boolean
  email_notify_watchlist_starting: boolean
  total_bids: number
  total_wins: number
  total_spent: number
  role: 'user' | 'admin'
  is_active: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  icon: string | null
  color: string | null
  image_url: string | null
  sort_order: number
  lot_count: number
  active_lot_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lot {
  id: string
  title: string
  description: string | null
  mpn: string | null
  manufacturer: string | null
  category_id: string | null
  condition: 'new' | 'used' | 'refurbished' | 'for-parts' | null
  quantity: number
  starting_price: number
  current_price: number
  reserve_price: number
  reserve_met: boolean
  buy_now_price: number | null
  bid_increment: number
  start_time: string
  end_time: string
  original_end_time: string
  extended: boolean
  extension_count: number
  bid_count: number
  winning_bidder_id: string | null
  winning_bidder_name: string | null
  last_bid_time: string | null
  status: 'draft' | 'scheduled' | 'active' | 'sold' | 'unsold' | 'cancelled'
  images: string[]
  pdfs: string[]
  thumbnail_url: string | null
  hide_bid_history: boolean
  hide_time_remaining: boolean
  featured_lot: boolean
  keywords: string[]
  allow_offers: boolean
  minimum_offer: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  sold_at: string | null
  sold_to: string | null
  sold_price: number | null
  view_count: number
  watch_count: number
}

export interface Bid {
  id: string
  lot_id: string
  user_id: string
  user_name: string | null
  amount: number
  is_winning: boolean
  is_auto_bid: boolean
  ip_address: string | null
  user_agent: string | null
  status: 'active' | 'outbid' | 'won' | 'lost'
  created_at: string
}

export interface Offer {
  id: string
  lot_id: string
  user_id: string
  lot_title: string | null
  user_name: string | null
  user_email: string | null
  amount: number
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn'
  admin_response: string | null
  responded_by: string | null
  responded_at: string | null
  counter_amount: number | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface WatchlistItem {
  id: string
  user_id: string
  lot_id: string
  lot_title: string | null
  lot_thumbnail: string | null
  lot_current_price: number | null
  lot_end_time: string | null
  lot_status: string | null
  notify_on_outbid: boolean
  notify_on_ending: boolean
  notified_ending: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  lot_id: string | null
  offer_id: string | null
  type: 'outbid' | 'won' | 'lost' | 'ending_soon' | 'offer_accepted' | 'offer_rejected' | 'offer_countered' | 'watchlist_starting' | 'payment_reminder' | 'auction_extended'
  title: string
  message: string
  action_url: string | null
  action_text: string | null
  read: boolean
  email_sent: boolean
  push_sent: boolean
  created_at: string
  read_at: string | null
}

export interface Invoice {
  id: string
  invoice_number: string
  user_id: string
  user_name: string | null
  user_email: string | null
  subtotal: number
  tax: number
  shipping: number
  total: number
  payment_method: 'stripe' | 'wire' | 'check' | 'cash' | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  paid_at: string | null
  stripe_payment_intent_id: string | null
  shipping_name: string | null
  shipping_street: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  shipping_status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number: string | null
  shipped_at: string | null
  created_at: string
  updated_at: string
  due_date: string | null
  admin_notes: string | null
  customer_notes: string | null
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  lot_id: string
  lot_title: string
  mpn: string | null
  quantity: number
  price: number
  subtotal: number
  created_at: string
}

export interface SiteSettings {
  id: string
  site_name: string
  site_description: string | null
  contact_email: string | null
  support_email: string | null
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  default_bid_increment: number
  minimum_bid_increment: number
  extension_time: number
  extension_window: number
  send_email_notifications: boolean
  email_provider: 'sendgrid' | 'mailgun' | 'resend' | null
  stripe_enabled: boolean
  stripe_publishable_key: string | null
  tax_rate: number
  allow_offers: boolean
  allow_buy_now: boolean
  require_email_verification: boolean
  company_name: string | null
  company_street: string | null
  company_city: string | null
  company_state: string | null
  company_zip: string | null
  company_country: string | null
  terms_of_service_url: string | null
  privacy_policy_url: string | null
  updated_at: string
  updated_by: string | null
}

export interface ActivityLog {
  id: string
  user_id: string | null
  user_name: string | null
  user_role: string | null
  action: string
  resource: string
  resource_id: string | null
  changes: Record<string, any> | null
  description: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
```

---

## 🔗 **Entity Relationship Diagram**
```
users
  ├─── lots (created_by)
  ├─── lots (winning_bidder_id)
  ├─── lots (sold_to)
  ├─── bids (user_id)
  ├─── offers (user_id)
  ├─── watchlist (user_id)
  ├─── notifications (user_id)
  ├─── invoices (user_id)
  └─── activity_log (user_id)

categories
  └─── lots (category_id)

lots
  ├─── bids (lot_id) [CASCADE]
  ├─── offers (lot_id) [CASCADE]
  ├─── watchlist (lot_id) [CASCADE]
  ├─── notifications (lot_id) [CASCADE]
  └─── invoice_items (lot_id) [RESTRICT]

invoices
  └─── invoice_items (invoice_id) [CASCADE]

offers
  └─── notifications (offer_id) [CASCADE]