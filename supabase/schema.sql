-- Paste this into: Supabase Dashboard → SQL Editor → New query → Run
-- Project: ksqzhueskpluejakntok

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  free_credits integer not null default 3,
  is_pro boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read own row" on public.users;
create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

-- Users cannot change their own credit balance from the browser.
drop policy if exists "Users can update own row" on public.users;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, free_credits, is_pro)
  values (new.id, new.email, 3, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
