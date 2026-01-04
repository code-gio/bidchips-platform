# API Changes - Removed Payments, Added Sales Records

## ✅ Removed Endpoints

### Payment-Related
- ❌ `POST /api/lots/:id/buy-now` - Buy Now feature removed
- ❌ `POST /api/invoices/:id/pay` - Payment processing removed
- ❌ `POST /webhooks/stripe` - Stripe webhook removed
- ❌ `GET /api/user/invoices` - User invoices endpoint removed
- ❌ `GET /api/invoices/:id` - Invoice details endpoint removed

## ✅ New Endpoints

### User Endpoints
- ✅ `GET /api/user/won` - Get user's won lots
- ✅ `GET /api/user/won/:id` - Get won lot details with sale record

### Admin Endpoints - Sales Records
- ✅ `GET /api/admin/sales` - Get all sales records
- ✅ `GET /api/admin/sales/pending` - Get pending payment sales
- ✅ `GET /api/admin/sales/completed` - Get paid sales
- ✅ `GET /api/admin/sales/:id` - Get sale record details
- ✅ `PUT /api/admin/sales/:id` - Update sale record
- ✅ `PUT /api/admin/sales/:id/mark-paid` - Mark sale as paid (offline)
- ✅ `PUT /api/admin/sales/:id/ship` - Mark sale as shipped

## 🔄 Updated Endpoints

### Modified to Use Sales Records
- `PUT /api/admin/offers/:id/accept` - Now creates sales record instead of invoice
- `GET /api/admin/dashboard/stats` - Now uses `sales_records` table instead of `invoices`
  - Changed `pending_invoices` to `pending_sales`
  - Revenue calculation now uses `sale_price` from sales records

### Cron Jobs
- `closeAuctions()` - Now creates sales records instead of invoices
- Notification URLs updated from `/invoices/:id` to `/won/:id`

## 📊 Database Schema Changes

### New Table: `sales_records`
```typescript
{
  id: string
  lot_id: string
  user_id: string
  sale_type: 'auction_win' | 'offer_accepted'
  sale_price: number
  lot_title: string
  lot_mpn: string | null
  user_name: string | null
  user_email: string | null
  shipping_name: string | null
  shipping_street: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  payment_status: 'pending' | 'paid' | 'overdue'
  payment_received_at: string | null
  payment_method: string | null
  payment_reference: string | null
  shipping_status: 'pending' | 'shipped' | 'delivered'
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  admin_notes: string | null
  customer_notes: string | null
}
```

### Removed Fields from `lots`
- ❌ `buy_now_price: number | null`

### Removed Fields from `settings`
- ❌ `stripe_enabled: boolean`
- ❌ `stripe_publishable_key: string | null`

## 🎯 Key Changes

1. **Simplified Payment Flow**: No online payment processing - all payments tracked offline
2. **Sales Records**: Replaced complex invoice system with simpler sales tracking
3. **Won Lots**: Users can now view their won lots with associated sale records
4. **Admin Sales Management**: Admins can track, mark as paid, and ship sales manually
5. **Removed Stripe**: All Stripe-related code and endpoints removed

## 📝 Migration Notes

When migrating the database:
1. Create `sales_records` table with the schema above
2. Migrate existing invoice data to sales records (if needed)
3. Remove `buy_now_price` column from `lots` table
4. Remove Stripe-related columns from `settings` table
5. Update any frontend code that references:
   - `/api/invoices/*` → `/api/user/won/*` or `/api/admin/sales/*`
   - `buy_now_price` → remove feature
   - Stripe payment flows → remove

## 🔗 Related Files Updated

- `src/routes/api/admin/offers/[id]/accept/+server.ts`
- `src/routes/api/admin/dashboard/stats/+server.ts`
- `src/lib/server/cron-jobs.ts`
- `src/lib/server/api-errors.ts`
- All new sales record endpoints
- All new won lots endpoints

