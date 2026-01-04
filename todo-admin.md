# 🔨 **Admin Platform Build Guide - TODO List**

## ⚠️ **Important: Svelte 5 Guidelines**

**CRITICAL:** This project uses **Svelte 5** with the new runes system. Follow these rules:

### **State Management:**
- ✅ **ALWAYS use `$state()`** for reactive state variables
- ✅ **ALWAYS use `$derived()`** for computed/reactive values
- ❌ **NEVER use `let` with `$:` reactive statements** (old Svelte 4 syntax)
- ❌ **NEVER use `$:` for derived values** - use `$derived()` instead

### **Effects:**
- ⚠️ **BE CAREFUL with `$effect()`** - it can cause infinite loops!
- ✅ Use `$effect()` only for side effects (API calls, DOM manipulation)
- ❌ **NEVER use `$effect()` to update state that triggers the same effect**
- ✅ Prefer `$derived()` for computed values instead of `$effect()`
- ✅ Use `onMount()` for initialization logic instead of `$effect()`

### **Examples:**

```svelte
<!-- ✅ CORRECT -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  onMount(() => {
    // Initialization
  });
</script>

<!-- ❌ WRONG - Old Svelte 4 syntax -->
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

<!-- ❌ WRONG - Can cause infinite loop -->
<script>
  let count = $state(0);
  $effect(() => {
    count++; // This will loop forever!
  });
</script>
```

---

## 📁 **Project Structure**

```
src/
├── lib/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── lots/
│   │   │   ├── bids/
│   │   │   ├── offers/
│   │   │   ├── categories/
│   │   │   ├── users/
│   │   │   ├── sales/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── shared/
│   │   └── ui/ (shadcn components)
│   ├── stores/
│   ├── utils/
│   └── api/
└── routes/
    └── admin/
```

---

# ✅ **Phase 1: Foundation & Layout** (Start Here)

## **1.1 Admin Layout & Navigation**

### **File:** `src/routes/admin/+layout.svelte`
- [ ] Create admin layout wrapper
- [ ] Implement sidebar navigation using `navAdmin` config
- [ ] Add user dropdown with admin quick actions
- [ ] Add breadcrumbs component
- [ ] Protect route with admin role check
- [ ] Add loading state wrapper

**shadcn Components:** `Sheet`, `Dropdown Menu`, `Avatar`, `Separator`, `Breadcrumb`

**API:** `GET /api/user/profile` (check role)

---

### **File:** `src/lib/components/admin/shared/AdminSidebar.svelte`
- [ ] Render navigation from `navAdmin` config
- [ ] Highlight active route
- [ ] Collapsible sidebar functionality
- [ ] Mobile responsive drawer
- [ ] Badge for pending offers count
- [ ] Badge for active auctions count

**shadcn Components:** `Sheet`, `Button`, `Badge`, `ScrollArea`

**API:** 
- `GET /api/admin/offers/pending` (count)
- `GET /api/admin/lots/active` (count)

---

### **File:** `src/lib/components/admin/shared/AdminHeader.svelte`
- [ ] Site title/logo
- [ ] Search bar (global search)
- [ ] Notification bell with dropdown
- [ ] User dropdown menu
- [ ] Quick action buttons (Create Lot, etc.)

**shadcn Components:** `Input`, `Dropdown Menu`, `Badge`, `Popover`

**API:** `GET /api/notifications/unread`

---

## **1.2 Shared Admin Components**

### **File:** `src/lib/components/admin/shared/DataTable.svelte`
- [ ] Reusable table component with sorting
- [ ] Pagination controls
- [ ] Row selection (checkboxes)
- [ ] Column filtering
- [ ] Bulk actions toolbar
- [ ] Empty state
- [ ] Loading skeleton

**shadcn Components:** `Table`, `Checkbox`, `Button`, `Input`, `Select`, `Skeleton`

---

### **File:** `src/lib/components/admin/shared/StatCard.svelte`
- [ ] Card with icon, title, value, change percentage
- [ ] Trend indicator (up/down arrow)
- [ ] Loading state
- [ ] Optional click action

**shadcn Components:** `Card`, `Badge`

---

### **File:** `src/lib/components/admin/shared/ConfirmDialog.svelte`
- [ ] Reusable confirmation modal
- [ ] Title, description, confirm/cancel buttons
- [ ] Loading state on confirm
- [ ] Variant (danger, warning, info)

**shadcn Components:** `Alert Dialog`, `Button`

---

### **File:** `src/lib/components/admin/shared/Toast.svelte`
- [ ] Success toast
- [ ] Error toast
- [ ] Warning toast
- [ ] Info toast

**shadcn Components:** `Toast`, `Toaster`

---

# ✅ **Phase 2: Admin Dashboard** (Critical Path)

## **2.1 Dashboard Overview**

### **File:** `src/routes/admin/+page.svelte`
- [ ] Page title "Admin Dashboard"
- [ ] Stats grid (4 cards)
- [ ] Recent activity table
- [ ] Active auctions list
- [ ] Pending offers list
- [ ] Quick actions panel

**shadcn Components:** `Card`, `Table`, `Button`, `Badge`

**API:** `GET /api/admin/dashboard/stats`

---

### **File:** `src/lib/components/admin/dashboard/StatsGrid.svelte`
- [ ] Total Users card (with 30d change)
- [ ] Active Lots card
- [ ] Total Bids Today card
- [ ] Revenue (30d) card
- [ ] Pending Offers badge
- [ ] Grid responsive layout (2x2 on desktop, 1 col mobile)

**shadcn Components:** `Card`, `Badge`

**API:** `GET /api/admin/dashboard/stats`

---

### **File:** `src/lib/components/admin/dashboard/RecentActivity.svelte`
- [ ] Table of last 10 activities
- [ ] User name, action, resource, timestamp
- [ ] Action icons
- [ ] Link to resource
- [ ] "View All" button

**shadcn Components:** `Table`, `Button`, `Badge`

**API:** `GET /api/admin/activity-log?limit=10`

---

### **File:** `src/lib/components/admin/dashboard/ActiveAuctions.svelte`
- [ ] List of active lots ending soonest
- [ ] Lot title, current price, bid count, time remaining
- [ ] "View Lot" link
- [ ] Show top 5

**shadcn Components:** `Card`, `Badge`, `Button`

**API:** `GET /api/admin/lots/active?limit=5&sort=end_time`

---

### **File:** `src/lib/components/admin/dashboard/PendingOffers.svelte`
- [ ] List of pending offers
- [ ] User name, lot title, offer amount, timestamp
- [ ] Accept/Reject quick actions
- [ ] "View All" button

**shadcn Components:** `Card`, `Table`, `Button`

**API:** `GET /api/admin/offers/pending?limit=5`

---

# ✅ **Phase 3: Lots Management** (Core Feature)

## **3.1 Lots List Page**

### **File:** `src/routes/admin/lots/+page.svelte`
- [ ] Page title "All Lots"
- [ ] Filter tabs (All, Draft, Scheduled, Active, Sold, Unsold)
- [ ] Search input (title, MPN)
- [ ] Filter dropdowns (category, status, manufacturer)
- [ ] Data table with lots
- [ ] Bulk actions (delete, publish)
- [ ] "Create New Lot" button

**shadcn Components:** `Tabs`, `Input`, `Select`, `Button`, `Table`

**API:** `GET /api/admin/lots`

---

### **File:** `src/lib/components/admin/lots/LotsTable.svelte`
- [ ] Columns: Checkbox, Image, Title, MPN, Category, Status, Price, Bids, End Time, Actions
- [ ] Status badge with colors
- [ ] Action dropdown (Edit, Delete, Publish, Cancel)
- [ ] Sort by column headers
- [ ] Pagination

**shadcn Components:** `Table`, `Checkbox`, `Dropdown Menu`, `Badge`, `Avatar`

**API:** `GET /api/admin/lots` (with filters)

---

### **File:** `src/lib/components/admin/lots/LotStatusBadge.svelte`
- [ ] Draft - gray
- [ ] Scheduled - blue
- [ ] Active - green
- [ ] Sold - purple
- [ ] Unsold - orange
- [ ] Cancelled - red

**shadcn Components:** `Badge`

---

## **3.2 Create Lot Page**

### **File:** `src/routes/admin/lots/new/+page.svelte`
- [ ] Page title "Create New Lot"
- [ ] Multi-step form or single long form
- [ ] Save as draft button
- [ ] Publish button
- [ ] Cancel button

**shadcn Components:** `Card`, `Form`, `Button`, `Tabs`

**API:** `POST /api/admin/lots`

---

### **File:** `src/lib/components/admin/lots/LotForm.svelte`
- [ ] **Basic Info Section:**
  - [ ] Title input (required)
  - [ ] Description textarea (required)
  - [ ] MPN input
  - [ ] Manufacturer input
  - [ ] Category select (required)
  - [ ] Condition select (required)
  - [ ] Quantity input (required)

- [ ] **Pricing Section:**
  - [ ] Starting price input (required)
  - [ ] Reserve price input (required)
  - [ ] Bid increment input (required)
  - [ ] Minimum offer input (optional)

- [ ] **Timing Section:**
  - [ ] Start time datetime picker (required)
  - [ ] End time datetime picker (required)
  - [ ] Duration helper (shows hours/days)

- [ ] **Media Section:**
  - [ ] Image uploader (max 10)
  - [ ] Image preview with reorder
  - [ ] PDF uploader
  - [ ] PDF list with remove

- [ ] **Settings Section:**
  - [ ] Allow offers checkbox
  - [ ] Hide bid history checkbox
  - [ ] Hide time remaining checkbox
  - [ ] Featured lot checkbox
  - [ ] Keywords tags input

- [ ] Form validation
- [ ] Error messages
- [ ] Success toast on save

**shadcn Components:** `Input`, `Textarea`, `Select`, `Checkbox`, `Calendar`, `Label`, `Form`

**API:** 
- `POST /api/admin/lots`
- `POST /api/admin/upload/image`
- `POST /api/admin/upload/pdf`

---

### **File:** `src/lib/components/admin/lots/ImageUploader.svelte`
- [ ] Drag & drop area
- [ ] File input button
- [ ] Image preview grid
- [ ] Drag to reorder images
- [ ] Remove image button
- [ ] Set as thumbnail
- [ ] Max 10 images validation
- [ ] File size validation (5MB max)
- [ ] Progress bar during upload

**shadcn Components:** `Button`, `Card`, `Progress`

**API:** `POST /api/admin/upload/image`

---

### **File:** `src/lib/components/admin/lots/PDFUploader.svelte`
- [ ] File input button
- [ ] PDF list with file name, size
- [ ] Remove PDF button
- [ ] Progress bar during upload
- [ ] File size validation (10MB max)

**shadcn Components:** `Button`, `Table`, `Progress`

**API:** `POST /api/admin/upload/pdf`

---

## **3.3 Edit Lot Page**

### **File:** `src/routes/admin/lots/[id]/+page.svelte`
- [ ] Page title "Edit Lot"
- [ ] Load existing lot data
- [ ] Reuse `LotForm` component with populated data
- [ ] Show current bids in sidebar
- [ ] Show current offers in sidebar
- [ ] Update button
- [ ] Delete button (with confirmation)
- [ ] Cancel auction button (if active)

**shadcn Components:** `Card`, `Button`, `Alert Dialog`

**API:** 
- `GET /api/admin/lots/:id`
- `PUT /api/admin/lots/:id`
- `DELETE /api/admin/lots/:id`

---

### **File:** `src/lib/components/admin/lots/LotBidsSidebar.svelte`
- [ ] Card showing current bids
- [ ] Table with bidder, amount, timestamp
- [ ] Current winning bid highlighted
- [ ] "View All Bids" link

**shadcn Components:** `Card`, `Table`, `Badge`

**API:** `GET /api/admin/lots/:id/bids`

---

### **File:** `src/lib/components/admin/lots/LotOffersSidebar.svelte`
- [ ] Card showing current offers
- [ ] List with user, amount, status
- [ ] Accept/Reject buttons
- [ ] "View All Offers" link

**shadcn Components:** `Card`, `Table`, `Button`

**API:** `GET /api/admin/offers?lot_id=:id`

---

# ✅ **Phase 4: Bids & Offers Management**

## **4.1 All Bids Page**

### **File:** `src/routes/admin/bids/+page.svelte`
- [ ] Page title "All Bids"
- [ ] Filter by lot, user, status
- [ ] Date range filter
- [ ] Search by user name
- [ ] Bids data table

**shadcn Components:** `Input`, `Select`, `Calendar`, `Table`

**API:** `GET /api/admin/bids`

---

### **File:** `src/lib/components/admin/bids/BidsTable.svelte`
- [ ] Columns: Lot Title, Bidder, Amount, Status, Timestamp
- [ ] Status badge (Active, Outbid, Won, Lost)
- [ ] Link to lot
- [ ] Link to user profile
- [ ] Export to CSV button

**shadcn Components:** `Table`, `Badge`, `Button`

**API:** `GET /api/admin/bids`

---

## **4.2 Pending Offers Page**

### **File:** `src/routes/admin/offers/pending/+page.svelte`
- [ ] Page title "Pending Offers"
- [ ] Offers data table
- [ ] Quick accept/reject actions
- [ ] Filter by lot, user, date

**shadcn Components:** `Table`, `Button`, `Select`

**API:** `GET /api/admin/offers/pending`

---

### **File:** `src/lib/components/admin/offers/OffersTable.svelte`
- [ ] Columns: User, Lot, Offer Amount, Message, Timestamp, Actions
- [ ] Accept button (opens modal)
- [ ] Reject button (opens modal)
- [ ] Counter button (opens modal)
- [ ] Withdraw button

**shadcn Components:** `Table`, `Button`, `Dropdown Menu`

**API:** `GET /api/admin/offers`

---

### **File:** `src/lib/components/admin/offers/AcceptOfferModal.svelte`
- [ ] Display offer details
- [ ] Admin response textarea (optional)
- [ ] Confirm button
- [ ] Creates sale record on accept

**shadcn Components:** `Dialog`, `Textarea`, `Button`

**API:** `PUT /api/admin/offers/:id/accept`

---

### **File:** `src/lib/components/admin/offers/RejectOfferModal.svelte`
- [ ] Display offer details
- [ ] Admin response textarea (required)
- [ ] Confirm button

**shadcn Components:** `Dialog`, `Textarea`, `Button`

**API:** `PUT /api/admin/offers/:id/reject`

---

### **File:** `src/lib/components/admin/offers/CounterOfferModal.svelte`
- [ ] Display original offer
- [ ] Counter amount input
- [ ] Admin message textarea
- [ ] Send counter button

**shadcn Components:** `Dialog`, `Input`, `Textarea`, `Button`

**API:** `PUT /api/admin/offers/:id/counter`

---

# ✅ **Phase 5: Categories Management**

## **5.1 Categories List Page**

### **File:** `src/routes/admin/categories/+page.svelte`
- [ ] Page title "Categories"
- [ ] Data table with categories
- [ ] "Create Category" button
- [ ] Drag to reorder categories

**shadcn Components:** `Table`, `Button`

**API:** `GET /api/admin/categories`

---

### **File:** `src/lib/components/admin/categories/CategoriesTable.svelte`
- [ ] Columns: Icon, Name, Slug, Lot Count, Active, Actions
- [ ] Edit button (opens modal)
- [ ] Delete button (with confirmation)
- [ ] Active/Inactive toggle
- [ ] Drag handle for reordering

**shadcn Components:** `Table`, `Switch`, `Button`, `Dropdown Menu`

**API:** 
- `GET /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

---

### **File:** `src/lib/components/admin/categories/CreateCategoryModal.svelte`
- [ ] Name input (required)
- [ ] Slug input (auto-generate from name)
- [ ] Description textarea
- [ ] Icon select (icon picker)
- [ ] Color picker
- [ ] Parent category select (for nested)
- [ ] Active checkbox
- [ ] Create button

**shadcn Components:** `Dialog`, `Input`, `Textarea`, `Select`, `Checkbox`

**API:** `POST /api/admin/categories`

---

### **File:** `src/lib/components/admin/categories/EditCategoryModal.svelte`
- [ ] Same as create, but populated with existing data
- [ ] Update button
- [ ] Delete button

**shadcn Components:** `Dialog`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`

**API:** 
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

---

# ✅ **Phase 6: Users Management**

## **6.1 Users List Page**

### **File:** `src/routes/admin/users/+page.svelte`
- [ ] Page title "Users"
- [ ] Filter tabs (All, Active Bidders, Banned)
- [ ] Search by name, email
- [ ] Users data table

**shadcn Components:** `Tabs`, `Input`, `Table`

**API:** `GET /api/admin/users`

---

### **File:** `src/lib/components/admin/users/UsersTable.svelte`
- [ ] Columns: Avatar, Name, Email, Total Bids, Total Wins, Role, Status, Actions
- [ ] View profile button
- [ ] Ban/Unban button
- [ ] Change role button
- [ ] Status badge (Active, Banned)

**shadcn Components:** `Table`, `Avatar`, `Badge`, `Dropdown Menu`

**API:** `GET /api/admin/users`

---

### **File:** `src/lib/components/admin/users/UserDetailsModal.svelte`
- [ ] User info (name, email, company, phone)
- [ ] Address
- [ ] Stats (bids, wins, spent)
- [ ] Recent bids table
- [ ] Recent won lots
- [ ] Ban user button
- [ ] Change role button

**shadcn Components:** `Dialog`, `Table`, `Button`, `Badge`

**API:** `GET /api/admin/users/:id`

---

### **File:** `src/lib/components/admin/users/BanUserModal.svelte`
- [ ] Confirmation message
- [ ] Ban reason textarea (required)
- [ ] Confirm ban button

**shadcn Components:** `Dialog`, `Textarea`, `Button`

**API:** `PUT /api/admin/users/:id/ban`

---

# ✅ **Phase 7: Sales Records**

## **7.1 Sales Records Page**

### **File:** `src/routes/admin/sales/+page.svelte`
- [ ] Page title "Sales Records"
- [ ] Filter tabs (All, Pending Payment, Paid, Shipped)
- [ ] Date range filter
- [ ] Sales data table
- [ ] Export to CSV button

**shadcn Components:** `Tabs`, `Calendar`, `Table`, `Button`

**API:** `GET /api/admin/sales`

---

### **File:** `src/lib/components/admin/sales/SalesTable.svelte`
- [ ] Columns: Sale Date, Lot Title, Buyer, Sale Price, Payment Status, Shipping Status, Actions
- [ ] Payment status badge
- [ ] Shipping status badge
- [ ] Mark as paid button
- [ ] Mark as shipped button
- [ ] View details button

**shadcn Components:** `Table`, `Badge`, `Dropdown Menu`

**API:** `GET /api/admin/sales`

---

### **File:** `src/lib/components/admin/sales/MarkAsPaidModal.svelte`
- [ ] Sale details display
- [ ] Payment method select (Wire, Check, Cash)
- [ ] Payment reference input (wire conf #, check #)
- [ ] Payment received date picker
- [ ] Admin notes textarea
- [ ] Confirm button

**shadcn Components:** `Dialog`, `Select`, `Input`, `Calendar`, `Textarea`, `Button`

**API:** `PUT /api/admin/sales/:id/mark-paid`

---

### **File:** `src/lib/components/admin/sales/MarkAsShippedModal.svelte`
- [ ] Sale details display
- [ ] Tracking number input
- [ ] Carrier select (UPS, FedEx, USPS, DHL, Other)
- [ ] Shipped date picker (defaults to today)
- [ ] Admin notes textarea
- [ ] Confirm button

**shadcn Components:** `Dialog`, `Input`, `Select`, `Calendar`, `Textarea`, `Button`

**API:** `PUT /api/admin/sales/:id/ship`

---

### **File:** `src/lib/components/admin/sales/SaleDetailsModal.svelte`
- [ ] Sale information (lot, buyer, price, type)
- [ ] Payment details (status, method, reference, date)
- [ ] Shipping details (status, tracking, dates)
- [ ] Buyer shipping address
- [ ] Admin notes
- [ ] Customer notes
- [ ] Edit buttons for each section

**shadcn Components:** `Dialog`, `Card`, `Badge`, `Button`

**API:** `GET /api/admin/sales/:id`

---

# ✅ **Phase 8: Analytics**

## **8.1 Analytics Overview**

### **File:** `src/routes/admin/analytics/+page.svelte`
- [ ] Page title "Analytics Overview"
- [ ] Date range selector (7d, 30d, 90d, custom)
- [ ] Key metrics cards
- [ ] Charts (revenue, bids, users)
- [ ] Top performing lots table

**shadcn Components:** `Select`, `Calendar`, `Card`

**API:** `GET /api/admin/analytics/overview`

---

### **File:** `src/lib/components/admin/analytics/MetricsCards.svelte`
- [ ] Total revenue card (with change %)
- [ ] Total bids card
- [ ] Average sale price card
- [ ] Conversion rate card (bids to wins)

**shadcn Components:** `Card`, `Badge`

---

### **File:** `src/lib/components/admin/analytics/RevenueChart.svelte`
- [ ] Line chart showing revenue over time
- [ ] Use Chart.js or similar
- [ ] Responsive

**shadcn Components:** `Card`

---

### **File:** `src/lib/components/admin/analytics/TopLotsTable.svelte`
- [ ] Table of top 10 lots by revenue
- [ ] Lot title, final price, bid count, winner

**shadcn Components:** `Table`, `Card`

**API:** `GET /api/admin/analytics/lots`

---

# ✅ **Phase 9: Settings**

## **9.1 General Settings Page**

### **File:** `src/routes/admin/settings/general/+page.svelte`
- [ ] Page title "General Settings"
- [ ] Settings form
- [ ] Save button

**shadcn Components:** `Card`, `Form`, `Button`

**API:** 
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

---

### **File:** `src/lib/components/admin/settings/GeneralSettingsForm.svelte`
- [ ] Site name input
- [ ] Site description textarea
- [ ] Contact email input
- [ ] Support email input
- [ ] Company name input
- [ ] Company address inputs
- [ ] Save changes button

**shadcn Components:** `Input`, `Textarea`, `Button`, `Label`

**API:** `PUT /api/admin/settings`

---

## **9.2 Auction Settings Page**

### **File:** `src/routes/admin/settings/auction/+page.svelte`
- [ ] Page title "Auction Settings"
- [ ] Auction settings form

**shadcn Components:** `Card`, `Form`

**API:** 
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

---

### **File:** `src/lib/components/admin/settings/AuctionSettingsForm.svelte`
- [ ] Default bid increment input
- [ ] Minimum bid increment input
- [ ] Extension time input (minutes)
- [ ] Extension window input (minutes)
- [ ] Allow offers toggle
- [ ] Require email verification toggle
- [ ] Save button

**shadcn Components:** `Input`, `Switch`, `Button`, `Label`

**API:** `PUT /api/admin/settings`

---

## **9.3 Email Settings Page**

### **File:** `src/routes/admin/settings/email/+page.svelte`
- [ ] Page title "Email Notification Settings"
- [ ] Email settings form

**shadcn Components:** `Card`, `Form`

**API:** 
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

---

### **File:** `src/lib/components/admin/settings/EmailSettingsForm.svelte`
- [ ] Send email notifications toggle
- [ ] Email provider select (SendGrid, Mailgun, Resend)
- [ ] Test email button
- [ ] Save button

**shadcn Components:** `Switch`, `Select`, `Button`, `Label`

**API:** `PUT /api/admin/settings`

---

## **9.4 Branding Settings Page**

### **File:** `src/routes/admin/settings/branding/+page.svelte`
- [ ] Page title "Branding & Logo"
- [ ] Logo uploader
- [ ] Favicon uploader
- [ ] Primary color picker

**shadcn Components:** `Card`, `Button`

**API:** 
- `POST /api/admin/settings/logo`
- `POST /api/admin/settings/favicon`
- `PUT /api/admin/settings`

---

### **File:** `src/lib/components/admin/settings/LogoUploader.svelte`
- [ ] Current logo preview
- [ ] Upload new logo button
- [ ] Remove logo button
- [ ] Max size: 2MB
- [ ] Supported: PNG, JPG, SVG

**shadcn Components:** `Card`, `Button`, `Avatar`

**API:** `POST /api/admin/settings/logo`

---

### **File:** `src/lib/components/admin/settings/ColorPicker.svelte`
- [ ] Color input (hex)
- [ ] Color preview swatch
- [ ] Preset colors
- [ ] Apply button (shows preview)

**shadcn Components:** `Input`, `Button`, `Card`

**API:** `PUT /api/admin/settings`

---

# ✅ **Phase 10: Activity Log**

### **File:** `src/routes/admin/activity-log/+page.svelte`
- [ ] Page title "Activity Log"
- [ ] Filter by user, action, resource
- [ ] Date range filter
- [ ] Search input
- [ ] Activity table
- [ ] Export to CSV button

**shadcn Components:** `Input`, `Select`, `Calendar`, `Table`, `Button`

**API:** `GET /api/admin/activity-log`

---

### **File:** `src/lib/components/admin/activity-log/ActivityTable.svelte`
- [ ] Columns: Timestamp, User, Action, Resource, Description
- [ ] Action badge with color coding
- [ ] Link to resource (if exists)
- [ ] View details button (shows changes JSON)

**shadcn Components:** `Table`, `Badge`, `Dialog`

**API:** `GET /api/admin/activity-log`

---

# 🎨 **CSS Variables Setup**

### **File:** `src/app.css`


# 🚀 **Build Order Priority**

**Week 1:**
1. ✅ Admin layout & navigation
2. ✅ Shared components (DataTable, StatCard, Toast)
3. ✅ Dashboard overview

**Week 2:**
4. ✅ Lots list page
5. ✅ Create lot page (without media upload)
6. ✅ Edit lot page

**Week 3:**
7. ✅ Image/PDF uploaders
8. ✅ Bids table
9. ✅ Offers management

**Week 4:**
10. ✅ Categories management
11. ✅ Users management
12. ✅ Sales records

**Week 5:**
13. ✅ Analytics
14. ✅ Settings pages
15. ✅ Activity log

---

**Start with Phase 1 and Phase 2 to get the foundation in place, then move to Phase 3 for core auction functionality!**