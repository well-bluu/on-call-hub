create table public.shift_assignments(
id uuid primary key default gen_random_uuid(),
shift_id uuid not null references public.shifts(shift_id) on delete restrict,
worker_id uuid not null references public.profiles(id) on delete restrict,
response_status text not null default 'pending',
responded_at timestamptz,
created_at timestamptz not null default now(),

constraint shift_assignments_shift_worker_key unique (shift_id, worker_id),
constraint shift_assignments_response_status_check check (response_status in ('pending', 'accepted', 'declined', 'expired', 'cancelled'))
);

comment on table public.shift_assignments is
    'Shift offers: one row per worker offered a shift. created_at is the offer time.';

alter table public.shift_assignments enable row level security;

-- Indexes (the unique constraints already covers lookupbs by shift_id)
create index shift_assignments_worker_id_idx
    on public.shift_assignments (worker_id);
create index shift_assignments_pending_idx
    on public.shift_assignments (created_at)
    where response_status = 'pending';

-- Grants
revoke all on table public.shift_assignments from anon, authenticated, public;
grant select on table public.shift_assignments to authenticated;

-- Policies
create policy "Workers can view their own offers"
on public.shift_assignments
for select
to authenticated
using (
worker_id = (select auth.uid())
and (select private.authorize('shift.view.own'))
);

create policy "Owners can view all offers"
on public.shift_assignments
for select
to authenticated
using((select private.authorize('shift.view.all')));

-- Workers can read the shifts they were offered
create policy "Workers can view shifts they were offered"
on public.shifts
for select
to authenticated
using (
    (select private.authorize('shift.view.own'))
    and exists (
    select 1
    from public.shift_assignments a
    where a.shift_id = shifts.shift_id
        and a.worker_id = (select auth.uid())
    )
);