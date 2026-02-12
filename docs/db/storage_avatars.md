# Storage bucket: `avatars`

The onboarding avatar upload uses the **`avatars`** bucket in Supabase Storage. Create it once so `/api/user/avatar/upload` works.

## Public vs private bucket

- **Public bucket:** Avatar URLs from `getPublicUrl()` work directly in `<img src="...">`. No extra setup.
- **Private bucket (recommended):** The app stores only the **path** (e.g. `userId/file.jpg`) and serves images via **signed URLs**:
  - `POST /api/user/avatar/upload` returns `{ path, url }` (path for DB, url is a short-lived signed URL).
  - `GET /api/user/avatar/signed?path=...` redirects to a signed URL (requires auth; path must be `userId/...`).
  - The UI uses the signed endpoint when `avatar_url` is a path or an old storage URL, so avatars work with a private bucket and your RLS policies.

## Option 1: Supabase Dashboard (recommended)

1. Open your project in [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Storage** in the left sidebar.
3. Click **New bucket**.
4. Set:
   - **Name:** `avatars`
   - **Public bucket:** **On** (so avatar URLs work in `<img>` without signed URLs).
5. Click **Create bucket**.

### Policies (RLS)

If you use RLS on storage, allow the backend (service role) to manage objects. The app uploads via the API using the service role, so no extra policy is required for uploads. If you want authenticated users to upload directly from the client, add a policy like:

- **Insert:** Allow authenticated users to upload into `avatars/{user_id}/*`.
- **Select:** Allow public read (or allow authenticated) so avatar images can be loaded.

For the current setup (server-side upload only), the default or no policy is fine as long as the service role can write.

## Option 2: SQL (optional)

Supabase Storage buckets are stored in `storage.buckets`. You can create the bucket with SQL run in the SQL Editor:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;
```

Then allow public read access for the bucket (so `getPublicUrl` works for `<img>`):

```sql
create policy "Avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated uploads to own folder (optional; we use API with service role)
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
```

If you only ever upload via the API (service role), the second policy is optional; the first makes avatar URLs publicly readable.

---

## Storage rules (policies) for `avatars`

Run this in the Supabase **SQL Editor** after the bucket exists. These policies go on `storage.objects` for the `avatars` bucket.

```sql
-- 1. Public read: anyone can view avatar images (needed for <img src="...">)
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

-- 2. Authenticated users can upload only into their own folder: avatars/{user_id}/*
create policy "avatars_authenticated_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Users can update/overwrite their own avatar (same path rule)
create policy "avatars_authenticated_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Users can delete their own avatar
create policy "avatars_authenticated_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

Summary:

| Policy                    | Operation | Who              | Rule                                      |
|---------------------------|-----------|------------------|-------------------------------------------|
| `avatars_public_read`     | SELECT    | Public           | Any object in bucket `avatars`            |
| `avatars_authenticated_upload`  | INSERT    | Authenticated    | Path must be `avatars/{auth.uid()}/...`   |
| `avatars_authenticated_update` | UPDATE    | Authenticated    | Same path = own folder                    |
| `avatars_authenticated_delete` | DELETE    | Authenticated    | Same path = own folder                    |

If you **only** upload via the API (service role bypasses RLS), you can create just the **select** policy so avatars are publicly readable; the insert/update/delete policies are for future client-side uploads or direct storage access.
