alter table public.shifts enable row level security;

revoke all on table public.shifts from anon, authenticated, public;

grant insert on table public.shifts to authenticated;

create policy "Owners can create shifts"
on public.shifts
for insert
to authenticated
with check (
  (select auth.uid()) = profile_id
  and (select private.authorize('shift.create'))
);