-- Add onboarding profile fields: tagline, language, birth_date
-- country is already stored in address_country.

alter table public.profiles
  add column if not exists tagline text null,
  add column if not exists bio text null,
  add column if not exists language character varying(10) null default 'en',
  add column if not exists birth_date date null;
