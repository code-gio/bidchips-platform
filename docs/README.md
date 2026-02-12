# Bidchips Platform — Documentation

This folder holds project documentation. The database schema and reference SQL live under `db/`.

---

## Database

The app uses **Supabase** (PostgreSQL). User-related data lives in a single **profiles** table (one row per auth user); multiple addresses per user are stored in **user_addresses**.

### Overview

| Concept | Description |
|--------|-------------|
| **Auth** | Supabase Auth (`auth.users`). Each account has a unique `id` (UUID). |
| **Profile** | One row in `public.profiles` per auth user. `profiles.id` = `auth.users.id`. All app user fields (name, email, preferences, stats, etc.) are on this table. |
| **Addresses** | Optional multiple addresses per user in `public.user_addresses`, linked by `user_id` → `profiles.id`. |

### Tables (reference)

- **`public.profiles`** — Single table for user data (id = auth user id). Holds email, name, username, timezone, avatar, address fields, notification preferences, bidding stats, role, onboarding flag, timestamps. See `db/profiles_table.sql`.
- **`public.user_addresses`** — Multiple addresses per profile. Columns: label, is_default, street, city, state, zip, country. See `db/user_addresses.sql`.

### SQL scripts in `docs/db/`

Scripts are named without date prefixes for readability. **Execution order** if applying manually:

1. **`shared_updated_at.sql`** — Defines `update_updated_at_column()`. Used by triggers to set `updated_at` on update.
2. **`profiles_table.sql`** — Creates (or replaces) the `profiles` table, indexes, triggers, and RLS policies. Also defines the trigger that creates a profile row when a new user signs up.
3. **`user_addresses.sql`** — Creates the `user_addresses` table and its trigger. Depends on `profiles` existing.

For normal development and deployments, use the versioned migrations under **`supabase/migrations/`**; the `docs/db/` files are for reference and documentation.

### Storage bucket for avatars

Avatar uploads (onboarding and profile) use the **`avatars`** bucket. Create it in the Supabase Dashboard or via SQL before using uploads. See **[docs/db/storage_avatars.md](db/storage_avatars.md)** for step-by-step instructions.

### Main relationships

- `profiles.id` → `auth.users.id` (one-to-one).
- `user_addresses.user_id` → `profiles.id` (many-to-one). Deleting a profile cascades to its addresses.

### Triggers

- **`update_profiles_updated_at`** / **`update_user_addresses_updated_at`** — Set `updated_at = now()` on row update.
- **`on_auth_user_created`** — After insert into `auth.users`, inserts a row into `profiles` with id, email, display_name, and role.

### RLS (Row Level Security)

- **profiles**: Users can `SELECT` and `UPDATE` only their own row (`auth.uid() = id`).
- **user_addresses**: No RLS defined in the reference scripts; add policies as needed for your app.

---

*Keep this README updated when you add or change tables or scripts in `db/`.*
