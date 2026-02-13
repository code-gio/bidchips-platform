-- Rename address_country to country in profiles (only country is kept for address in profiles).
alter table public.profiles rename column address_country to country;
