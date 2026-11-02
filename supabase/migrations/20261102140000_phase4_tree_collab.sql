-- Phase 4+: members, relationships, invitations, access tokens, events, memories, subscriptions
-- Requires 20261102120000_phase2_foundation.sql

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  member_code text not null,
  member_type text not null default 'real' check (member_type in ('real', 'placeholder')),
  first_name text not null default '',
  middle_name text,
  last_name text,
  display_name text,
  gender text check (gender is null or gender in ('male', 'female', 'other', 'unknown')),
  date_of_birth date,
  date_of_death date,
  is_deceased boolean not null default false,
  email text,
  phone text,
  location text,
  biography text,
  occupation text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, member_code)
);

create index if not exists members_family_id_idx on public.members (family_id);

create or replace function public.next_member_code(p_family_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  select count(*)::integer + 1 into n from public.members where family_id = p_family_id;
  return 'MEM-' || lpad(n::text, 6, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- relationships
-- ---------------------------------------------------------------------------
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  source_member_id uuid not null references public.members (id) on delete cascade,
  target_member_id uuid not null references public.members (id) on delete cascade,
  relationship_type text not null check (relationship_type in ('parent', 'partner')),
  relationship_status text not null default 'active'
    check (relationship_status in ('active', 'ended', 'unknown')),
  start_date date,
  end_date date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_member_id <> target_member_id)
);

create unique index if not exists relationships_unique_pair
  on public.relationships (
    family_id,
    relationship_type,
    least(source_member_id, target_member_id),
    greatest(source_member_id, target_member_id)
  )
  where relationship_type = 'partner' and relationship_status = 'active';

create unique index if not exists relationships_unique_parent
  on public.relationships (family_id, source_member_id, target_member_id, relationship_type)
  where relationship_type = 'parent';

create index if not exists relationships_family_id_idx on public.relationships (family_id);

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  invited_by uuid not null references public.profiles (id),
  accepted_by uuid references public.profiles (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_family_id_idx on public.invitations (family_id);

-- ---------------------------------------------------------------------------
-- access tokens (Account Owner managed)
-- ---------------------------------------------------------------------------
create table if not exists public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  account_owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  token_hash text not null unique,
  token_preview text not null,
  permission text not null check (permission in ('view', 'edit')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'revoked')),
  starts_at timestamptz,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_token_families (
  id uuid primary key default gen_random_uuid(),
  access_token_id uuid not null references public.access_tokens (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')),
  unique (access_token_id, family_id)
);

-- ---------------------------------------------------------------------------
-- family_events
-- ---------------------------------------------------------------------------
create table if not exists public.family_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  event_type text not null default 'custom',
  event_date date,
  description text,
  member_ids uuid[] not null default '{}',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_events_family_id_idx on public.family_events (family_id);

-- ---------------------------------------------------------------------------
-- memories (no image binary columns)
-- ---------------------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  description text,
  memory_date date,
  location text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_family_id_idx on public.memories (family_id);

-- ---------------------------------------------------------------------------
-- subscriptions (entitlement records; payments via Edge later)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_owner_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status text not null default 'active'
    check (status in ('pending', 'active', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_owner_idx on public.subscriptions (account_owner_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.members enable row level security;
alter table public.relationships enable row level security;
alter table public.invitations enable row level security;
alter table public.access_tokens enable row level security;
alter table public.access_token_families enable row level security;
alter table public.family_events enable row level security;
alter table public.memories enable row level security;
alter table public.subscriptions enable row level security;

-- members
drop policy if exists "members_select" on public.members;
create policy "members_select" on public.members for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "members_insert" on public.members;
create policy "members_insert" on public.members for insert to authenticated
  with check (
    public.family_role(family_id) in ('owner', 'admin', 'editor')
  );

drop policy if exists "members_update" on public.members;
create policy "members_update" on public.members for update to authenticated
  using (public.family_role(family_id) in ('owner', 'admin', 'editor'))
  with check (public.family_role(family_id) in ('owner', 'admin', 'editor'));

drop policy if exists "members_delete" on public.members;
create policy "members_delete" on public.members for delete to authenticated
  using (public.family_role(family_id) in ('owner', 'admin'));

-- relationships
drop policy if exists "relationships_select" on public.relationships;
create policy "relationships_select" on public.relationships for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "relationships_write" on public.relationships;
create policy "relationships_write" on public.relationships for all to authenticated
  using (public.family_role(family_id) in ('owner', 'admin', 'editor'))
  with check (public.family_role(family_id) in ('owner', 'admin', 'editor'));

-- invitations
drop policy if exists "invitations_select" on public.invitations;
create policy "invitations_select" on public.invitations for select to authenticated
  using (
    public.family_role(family_id) in ('owner', 'admin')
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "invitations_write" on public.invitations;
create policy "invitations_write" on public.invitations for all to authenticated
  using (public.family_role(family_id) in ('owner', 'admin'))
  with check (public.family_role(family_id) in ('owner', 'admin'));

-- access tokens: only account owner of the token
drop policy if exists "access_tokens_owner" on public.access_tokens;
create policy "access_tokens_owner" on public.access_tokens for all to authenticated
  using (account_owner_id = auth.uid())
  with check (account_owner_id = auth.uid());

drop policy if exists "access_token_families_owner" on public.access_token_families;
create policy "access_token_families_owner" on public.access_token_families for all to authenticated
  using (
    exists (
      select 1 from public.access_tokens t
      where t.id = access_token_id and t.account_owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.access_tokens t
      where t.id = access_token_id and t.account_owner_id = auth.uid()
    )
  );

-- events / memories
drop policy if exists "events_select" on public.family_events;
create policy "events_select" on public.family_events for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "events_write" on public.family_events;
create policy "events_write" on public.family_events for all to authenticated
  using (public.family_role(family_id) in ('owner', 'admin', 'editor'))
  with check (public.family_role(family_id) in ('owner', 'admin', 'editor'));

drop policy if exists "memories_select" on public.memories;
create policy "memories_select" on public.memories for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "memories_write" on public.memories;
create policy "memories_write" on public.memories for all to authenticated
  using (public.family_role(family_id) in ('owner', 'admin', 'editor'))
  with check (public.family_role(family_id) in ('owner', 'admin', 'editor'));

-- subscriptions: owner reads own
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select to authenticated
  using (account_owner_id = auth.uid());

-- Client must not activate paid plans (Edge Functions / service role)
revoke insert, update, delete on public.subscriptions from authenticated, anon;
