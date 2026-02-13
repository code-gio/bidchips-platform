-- Single table for user data: profiles (id = auth.uid)
-- Replaces separate users table; all user fields live here.

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email character varying(255) not null,
  first_name character varying(100) null,
  last_name character varying(100) null,
  display_name character varying(200) null,
  username text unique,
  time_zone text not null default 'UTC',
  company character varying(200) null,
  phone character varying(20) null,
  avatar_url text null,
  -- address_street character varying(255) null,
  -- address_city character varying(100) null,
  -- address_state character varying(50) null,
  -- address_zip character varying(20) null,
  country character varying(2) null default 'US'::character varying,
  email_notify_outbid boolean null default true,
  email_notify_won boolean null default true,
  email_notify_ending_soon boolean null default true,
  email_notify_offer_response boolean null default true,
  email_notify_watchlist_starting boolean null default true,
  total_bids integer null default 0,
  total_wins integer null default 0,
  total_spent numeric(10, 2) null default 0,
  role character varying(20) null default 'user'::character varying,
  is_active boolean null default true,
  is_banned boolean null default false,
  onboarding_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  constraint profiles_email_key unique (email),
  constraint profiles_role_check check (
    (role)::text = any (
      (array['user'::character varying, 'admin'::character varying])::text[]
    )
  )
) tablespace pg_default;

create index if not exists idx_profiles_email on public.profiles using btree (email) tablespace pg_default;
create index if not exists idx_profiles_role on public.profiles using btree (role) tablespace pg_default;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role, created_at)
  values (
    new.id,
    new.email,
    coalesce(trim(
      coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' ||
      coalesce(new.raw_user_meta_data->>'last_name', '')
    ), new.email),
    'user',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
