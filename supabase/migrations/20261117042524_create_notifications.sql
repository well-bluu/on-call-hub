create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    recipient_id uuid not null references public.profiles(id) on delete cascade,
    category text not null,
    kind text not null,
    title text not null,
    body text,
    shift_id uuid references public.shifts(id) on delete set null,
    assignment_id uuid references public.shift_assignments(id) on delete set null,
    read_at timestamptz,
    created_at timestamptz not null default now(),

    constraint notifications_category_check
        check (category in ('shift', 'cancellation', 'reminder', 'account')),
    constraint notifications_kind_not_blank check (length(trim(kind)) > 0),
    constraint notifications_title_not_blank check (length(trim(title)) > 0)
);

comment on table public.notifications is
    'In-app notifications. One row per recipient. read_at null = unread. Rows are created only by private.notify().';

alter table public.notifications enable row level security;

-- Indexes
create index notifications_recipient_created_idx
    on public.notifications (recipient_id, created_at desc);
create index notifications_recipient_unread_idx
    on public.notifications (recipient_id)
    where read_at is null;
create index notifications_shift_id_idx
    on public.notifications (shift_id);
create index notifications_assignment_id_idx
    on public.notifications (assignment_id);

revoke all on table public.notifications from anon, authenticated, public;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (
    recipient_id = (select auth.uid())
    and (
        (select private.authorize('notification.view.worker'))
        or (select private.authorize('notification.view.owner'))
    )
);

create policy "Users can mark their own notifications as read"
on public.notifications
for update
to authenticated
using (
    recipient_id = (select auth.uid())
    and (
        (select private.authorize('notification.view.worker'))
        or (select private.authorize('notification.view.owner'))
    )
)
with check (recipient_id = (select auth.uid()));

create or replace function private.notify(
    p_recipient_id uuid,
    p_category text,
    p_kind text,
    p_title text,
    p_body text default null,
    p_shift_id uuid default null,
    p_assignment_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_id uuid;
begin
    insert into public.notifications
        (recipient_id, category, kind, title, body, shift_id, assignment_id)
    values
        (p_recipient_id, p_category, p_kind, p_title, p_body, p_shift_id, p_assignment_id)
    returning id into v_id;

    return v_id;
end;
$$;

revoke all on function private.notify(uuid, text, text, text, text, uuid, uuid)
    from public, anon, authenticated;

alter publication supabase_realtime add table public.notifications;
