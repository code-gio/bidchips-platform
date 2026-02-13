-- DEPRECATED: Use profile_addresses.sql instead (table profile_addresses, column profile_id, recipient_name).
-- User addresses table: multiple addresses per user (legacy name)
create table public.user_addresses (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  label character varying(50) null,
  is_default boolean not null default false,
  street character varying(255) null,
  city character varying(100) null,
  state character varying(50) null,
  zip character varying(20) null,
  country character varying(2) null default 'US'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_addresses_pkey primary key (id),
  constraint user_addresses_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_user_addresses_user_id on public.user_addresses using btree (user_id) tablespace pg_default;

create trigger update_user_addresses_updated_at
  before update on public.user_addresses
  for each row
  execute function public.update_updated_at_column();
