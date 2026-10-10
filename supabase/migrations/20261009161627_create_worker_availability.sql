create table public.worker_availability (
  id bigint generated always as identity primary key,
  worker_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'unavailable',
  updated_at timestamptz not null default now(),
  constraint worker_availability_status_check
    check (status in ('available', 'unavailable'))
);

comment on table public.worker_availability is
  'Current availability status of each worker.';

alter table public.worker_availability enable row level security;

-- Keep updated_at server-controlled
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all
on function private.set_updated_at()
from public, anon, authenticated;

create trigger set_worker_availability_updated_at
before update on public.worker_availability
for each row
execute function private.set_updated_at();

-- Grants
revoke all
on table public.worker_availability
from anon, authenticated, public;

grant select
on table public.worker_availability
to authenticated;

grant insert (worker_id, status), update (worker_id, status)
on table public.worker_availability
to authenticated;

-- Policies
create policy "Owners can view all availability"
on public.worker_availability
for select
to authenticated
using ((select private.authorize('availability.view.all')));

create policy "Workers can view their own availability"
on public.worker_availability
for select
to authenticated
using (
  worker_id = (select auth.uid())
  and (select private.authorize('availability.view.own'))
);

create policy "Workers can create their own availability"
on public.worker_availability
for insert
to authenticated
with check (
  worker_id = (select auth.uid())
  and (select private.authorize('availability.update.own'))
);

create policy "Workers can update their own availability"
on public.worker_availability
for update
to authenticated
using (
  worker_id = (select auth.uid())
  and (select private.authorize('availability.update.own'))
)
with check (
  worker_id = (select auth.uid())
  and (select private.authorize('availability.update.own'))
);
