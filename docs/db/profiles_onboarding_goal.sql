-- Store onboarding goal (buyer, seller, refer, project-management)

alter table public.profiles
  add column if not exists onboarding_goal character varying(50) null;
