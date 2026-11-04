-- Fix create-family chicken-and-egg:
-- INSERT ... RETURNING / membership EXISTS need SELECT on the new family,
-- but select previously required is_family_member() before membership existed.

drop policy if exists "families_select_member" on public.families;
create policy "families_select_member"
  on public.families for select
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_family_member(id)
  );

-- Atomic create used by the app (also safe under the fixed policies).
create or replace function public.create_family_with_owner(
  p_name text,
  p_description text default null,
  p_location text default null
)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_family public.families;
  v_owned integer;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Family name is required';
  end if;

  select count(*)::integer into v_owned
  from public.family_memberships m
  where m.user_id = v_uid
    and m.role = 'owner'
    and m.status = 'active';

  if v_owned >= 1 then
    raise exception 'Free plan allows one owned family';
  end if;

  insert into public.families (name, description, location, created_by)
  values (trim(p_name), nullif(trim(p_description), ''), nullif(trim(p_location), ''), v_uid)
  returning * into v_family;

  insert into public.family_memberships (family_id, user_id, role, status)
  values (v_family.id, v_uid, 'owner', 'active');

  return v_family;
end;
$$;

revoke all on function public.create_family_with_owner(text, text, text) from public;
grant execute on function public.create_family_with_owner(text, text, text) to authenticated;
