-- Phase 2 foundation: profiles, families, memberships, subscription_plans + RLS stubs
-- Apply in Supabase SQL Editor or via supabase db push.
-- Never expose service_role to the browser.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------------
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists families_created_by_idx on public.families (created_by);

-- ---------------------------------------------------------------------------
-- family_memberships
-- ---------------------------------------------------------------------------
create table if not exists public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  invited_by uuid references public.profiles (id),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists family_memberships_active_unique
  on public.family_memberships (family_id, user_id)
  where status = 'active';

create index if not exists family_memberships_user_id_idx on public.family_memberships (user_id);
create index if not exists family_memberships_family_id_idx on public.family_memberships (family_id);

-- ---------------------------------------------------------------------------
-- subscription_plans (seed Free / Family / Family Plus)
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  yearly_price_inr numeric(12, 2) not null default 0,
  max_owned_families integer not null,
  max_members integer not null,
  total_image_limit_bytes bigint not null,
  max_single_image_bytes bigint not null,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.subscription_plans (
  code, name, description, yearly_price_inr,
  max_owned_families, max_members,
  total_image_limit_bytes, max_single_image_bytes,
  features, is_active, sort_order
)
values
  (
    'free',
    'Free',
    'One owned family with basic tree tools.',
    0,
    1,
    150,
    104857600,
    2097152,
    '{"tree": true, "invites": true}'::jsonb,
    true,
    1
  ),
  (
    'family',
    'Family',
    'Larger family with expanded limits.',
    0,
    3,
    500,
    524288000,
    5242880,
    '{"tree": true, "invites": true, "priority_support": false}'::jsonb,
    true,
    2
  ),
  (
    'family_plus',
    'Family Plus',
    'Highest limits and premium family features.',
    0,
    10,
    2000,
    2147483648,
    10485760,
    '{"tree": true, "invites": true, "priority_support": true}'::jsonb,
    true,
    3
  )
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Helpers for RLS
-- ---------------------------------------------------------------------------
create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_memberships m
    where m.family_id = p_family_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.family_role(p_family_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.family_memberships m
  where m.family_id = p_family_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.subscription_plans enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- families: members can read; creator can insert; owners/admins can update
drop policy if exists "families_select_member" on public.families;
create policy "families_select_member"
  on public.families for select
  to authenticated
  using (public.is_family_member(id));

drop policy if exists "families_insert_authenticated" on public.families;
create policy "families_insert_authenticated"
  on public.families for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "families_update_owner_admin" on public.families;
create policy "families_update_owner_admin"
  on public.families for update
  to authenticated
  using (public.family_role(id) in ('owner', 'admin'))
  with check (public.family_role(id) in ('owner', 'admin'));

-- memberships
drop policy if exists "memberships_select_own_or_family" on public.family_memberships;
create policy "memberships_select_own_or_family"
  on public.family_memberships for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_family_member(family_id)
  );

drop policy if exists "memberships_insert_self_owner" on public.family_memberships;
create policy "memberships_insert_self_owner"
  on public.family_memberships for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.families f
      where f.id = family_id and f.created_by = auth.uid()
    )
  );

drop policy if exists "memberships_update_owner" on public.family_memberships;
create policy "memberships_update_owner"
  on public.family_memberships for update
  to authenticated
  using (public.family_role(family_id) = 'owner')
  with check (public.family_role(family_id) = 'owner');

-- plans: authenticated read of active plans
drop policy if exists "plans_select_active" on public.subscription_plans;
create policy "plans_select_active"
  on public.subscription_plans for select
  to authenticated
  using (is_active = true);

-- No client writes to plans (seed / service role only)
revoke insert, update, delete on public.subscription_plans from authenticated, anon;
