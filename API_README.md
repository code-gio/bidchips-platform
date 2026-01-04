# API Documentation

This document provides an overview of the API endpoints created for the auction platform.

## Structure

The API is organized into the following categories:

### 🔓 Public Endpoints (No Auth Required)
- `/api/lots` - Browse and search lots
- `/api/categories` - Get categories
- `/api/settings` - Get public site settings

### 🔐 User Endpoints (Auth Required)
- `/api/user/*` - User profile and preferences
- `/api/bids` - Place bids
- `/api/offers` - Submit offers
- `/api/watchlist` - Manage watchlist
- `/api/notifications` - Manage notifications
- `/api/invoices` - View invoices

### 👑 Admin Endpoints (Admin Role Required)
- `/api/admin/lots` - Manage lots
- `/api/admin/offers` - Manage offers
- `/api/admin/categories` - Manage categories
- `/api/admin/users` - Manage users
- `/api/admin/dashboard` - Dashboard statistics
- `/api/admin/settings` - Site settings
- `/api/admin/activity-log` - View activity logs

### 🎣 Webhooks
- `/webhooks/stripe` - Stripe payment webhooks

### ⏰ Cron Jobs
- `/api/cron/close-auctions` - Close expired auctions
- `/api/cron/ending-soon-notifications` - Send ending soon notifications

## Helper Utilities

### `src/lib/server/api-helpers.ts`
- `requireAuth(event)` - Require authentication
- `requireAdmin(event)` - Require admin role
- `successResponse(data, status)` - Return success response
- `errorResponse(message, status, code)` - Return error response
- `parseBody(event)` - Parse request body
- `getQueryParams(event)` - Get query parameters
- `getRouteParam(event, param)` - Get route parameter

### `src/lib/server/api-errors.ts`
- Centralized error codes and messages

### `src/lib/server/cron-jobs.ts`
- `closeAuctions()` - Close expired auctions
- `sendEndingSoonNotifications()` - Send ending soon notifications

## Key Features Implemented

### Bidding System
- ✅ Place bids with validation
- ✅ Automatic auction extension on last-minute bids
- ✅ Reserve price checking
- ✅ Outbid notifications
- ✅ Bid history (with privacy option)

### Offer System
- ✅ Submit offers
- ✅ Admin accept/reject/counter offers
- ✅ Automatic invoice generation on acceptance

### Buy Now
- ✅ Instant purchase at buy-now price
- ✅ Automatic invoice generation
- ✅ Mark all bids as lost

### Watchlist
- ✅ Add/remove lots
- ✅ Notification preferences
- ✅ Ending soon notifications

### Notifications
- ✅ Real-time notifications
- ✅ Mark as read/unread
- ✅ Bulk operations

### Admin Features
- ✅ Lot management (CRUD)
- ✅ Offer management
- ✅ User management (ban/unban)
- ✅ Dashboard statistics
- ✅ Activity logging

## Database Operations

The API uses two Supabase clients:

1. **`event.locals.supabase`** - User-scoped client (respects RLS)
   - Used for queries that should respect Row Level Security
   - Public endpoints and user-specific queries

2. **`supabaseAdmin`** - Admin client (bypasses RLS)
   - Used for admin operations and complex transactions
   - Server-side only, never exposed to client

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Success responses:

```json
{
  "success": true,
  "data": { ... }
}
```

## Authentication

- User endpoints require authentication via `requireAuth()`
- Admin endpoints require admin role via `requireAdmin()`
- Both check for active and non-banned accounts

## Cron Jobs Setup

To set up cron jobs, you can:

1. **Vercel Cron** - Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/close-auctions",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/ending-soon-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. **Supabase Edge Functions** - Create scheduled functions

3. **External Scheduler** - Call endpoints via HTTP

## Next Steps

1. **Add Stripe Integration** - Complete payment processing in buy-now and invoice endpoints
2. **Add File Upload** - Implement media upload endpoints for lot images/PDFs
3. **Add Email Notifications** - Integrate email service for notifications
4. **Add Rate Limiting** - Implement rate limiting for sensitive endpoints
5. **Add Request Validation** - Add Zod schemas for request validation
6. **Add API Documentation** - Generate OpenAPI/Swagger docs

## Testing

Endpoints can be tested using:
- Postman/Insomnia
- curl commands
- Frontend integration
- Automated tests

Example:
```bash
# Get active lots
curl http://localhost:5173/api/lots

# Place a bid (requires auth)
curl -X POST http://localhost:5173/api/bids \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-..." \
  -d '{"lot_id": "...", "amount": 100}'
```

