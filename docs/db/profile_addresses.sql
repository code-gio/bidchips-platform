-- Profile addresses: multiple addresses per profile (source of truth for address CRUD).
-- The address with is_default = true is synced to profiles.address_* for quick access.

create table if not exists public.profile_addresses (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null,
  recipient_name character varying(200) null,
  label character varying(50) null,
  is_default boolean not null default false,
  street character varying(255) null,
  city character varying(100) null,
  state character varying(50) null,
  zip character varying(20) null,
  country character varying(2) null default 'US'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profile_addresses_pkey primary key (id),
  constraint profile_addresses_profile_id_fkey foreign key (profile_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_profile_addresses_profile_id on public.profile_addresses using btree (profile_id) tablespace pg_default;
create unique index if not exists idx_profile_addresses_profile_id_default on public.profile_addresses (profile_id) where (is_default = true);

create trigger update_profile_addresses_updated_at
  before update on public.profile_addresses
  for each row
  execute function public.update_updated_at_column();

-- Optional: if you had user_addresses, migrate to profile_addresses:
-- alter table public.user_addresses rename to profile_addresses;
-- alter table public.profile_addresses rename column user_id to profile_id;
-- alter table public.profile_addresses add column if not exists recipient_name character varying(200) null;
