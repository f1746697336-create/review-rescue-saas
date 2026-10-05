-- Paste this into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run. This hardens RLS and adds signup IP rate-limit logging.
-- Optional: Authentication → Providers → Email → disable “Allow new users to
-- sign up”. Admin createUser used by /api/auth/signup still works; browser
-- signUp bypasses then receive 0 free credits.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  free_credits integer not null default 0,
  is_pro boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

alter table public.users alter column free_credits set default 0;

create table if not exists public.signup_ip_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists signup_ip_log_hash_created_idx
  on public.signup_ip_log (ip_hash, created_at desc);

alter table public.users enable row level security;
alter table public.signup_ip_log enable row level security;

revoke all on table public.users from anon, authenticated, public;
revoke all on table public.signup_ip_log from anon, authenticated, public;

grant select on table public.users to authenticated;

drop policy if exists "Users can read own row" on public.users;
drop policy if exists "Users can update own row" on public.users;
drop policy if exists "Users can insert own row" on public.users;
drop policy if exists "Users can delete own row" on public.users;
drop policy if exists "signup_ip_log no client access" on public.signup_ip_log;

create policy "Users can read own row"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- No insert / update / delete policies for authenticated or anon.
-- Credits, is_pro, and Stripe fields are writable only by service_role.
-- signup_ip_log has zero client policies, so only service_role can write.

create or replace function public.is_privileged_db_role()
returns boolean
language sql
stable
as $$
  select current_user in (
    'postgres',
    'supabase_admin',
    'supabase_auth_admin',
    'service_role'
  );
$$;

create or replace function public.enforce_users_row_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if auth.role() = 'service_role' or public.is_privileged_db_role() then
      return old;
    end if;
    raise exception 'Users cannot delete profile rows';
  end if;

  if auth.role() = 'service_role' or public.is_privileged_db_role() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'Users cannot insert profile rows';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Cannot change user id';
  end if;

  if new.is_pro is distinct from old.is_pro
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id
     or new.created_at is distinct from old.created_at
     or new.email is distinct from old.email then
    raise exception 'Cannot modify billing or identity fields';
  end if;

  if new.free_credits > old.free_credits then
    raise exception 'free_credits cannot be increased';
  end if;

  if new.free_credits < 0 then
    raise exception 'free_credits cannot be negative';
  end if;

  if new.free_credits < old.free_credits - 1 then
    raise exception 'free_credits can decrease by at most 1';
  end if;

  return new;
end;
$$;

drop trigger if exists users_row_guard on public.users;
create trigger users_row_guard
  before insert or update or delete on public.users
  for each row execute function public.enforce_users_row_guard();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Direct Auth signups get 0 credits. The /api/auth/signup route
  -- grants the free allowance only after the IP rate-limit check.
  insert into public.users (id, email, free_credits, is_pro)
  values (new.id, new.email, 0, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
