create or replace function private.notify_shift_assignment_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_name text;
    v_owner_id uuid;
    v_worker_name text;
begin
    select s.shift_name, s.created_by
    into v_shift_name, v_owner_id
    from public.shifts s
    where s.id = new.shift_id;

    select trim(concat(p.first_name, ' ', p.last_name))
    into v_worker_name
    from public.profiles p
    where p.id = new.worker_id;

    if tg_op = 'INSERT' and new.response_status = 'pending' then
        perform private.notify(
            new.worker_id,
            'shift',
            'shift_offer',
            'New shift offer',
            concat('You have a new offer for ', v_shift_name, '.'),
            new.shift_id,
            new.id
        );
    elsif tg_op = 'UPDATE' and old.response_status is distinct from new.response_status then
        if new.response_status = 'accepted' then
            perform private.notify(
                new.worker_id,
                'shift',
                'shift_confirmation',
                'Shift confirmed',
                concat('Your shift offer for ', v_shift_name, ' was confirmed.'),
                new.shift_id,
                new.id
            );
            perform private.notify(
                v_owner_id,
                'shift',
                'worker_accepted',
                'Worker accepted a shift',
                concat(coalesce(v_worker_name, 'A worker'), ' accepted ', v_shift_name, '.'),
                new.shift_id,
                new.id
            );
        elsif new.response_status = 'declined' then
            perform private.notify(
                v_owner_id,
                'shift',
                'worker_declined',
                'Worker declined a shift',
                concat(coalesce(v_worker_name, 'A worker'), ' declined ', v_shift_name, '.'),
                new.shift_id,
                new.id
            );
        elsif old.response_status = 'accepted' and new.response_status = 'cancelled' then
            if (select auth.uid()) = new.worker_id then
                perform private.notify(
                    new.worker_id,
                    'cancellation',
                    'cancellation_confirmed',
                    'Cancellation confirmed',
                    concat('Your cancellation for ', v_shift_name, ' was confirmed.'),
                    new.shift_id,
                    new.id
                );
                perform private.notify(
                    v_owner_id,
                    'cancellation',
                    'cancellation_request',
                    'Worker cancelled a shift',
                    concat(coalesce(v_worker_name, 'A worker'), ' cancelled ', v_shift_name, '.'),
                    new.shift_id,
                    new.id
                );
            end if;
        end if;
    end if;

    return new;
end;
$$;

create trigger notify_shift_assignment_event
after insert or update of response_status on public.shift_assignments
for each row
execute function private.notify_shift_assignment_event();

create or replace function private.notify_shift_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_assignment record;
    v_owner record;
    v_kind text;
    v_title text;
    v_body text;
begin
    if new.status = 'cancelled' and old.status is distinct from new.status then
        v_kind := 'shift_cancelled';
        v_title := 'Shift cancelled';
        v_body := concat('Your shift ', new.shift_name, ' was cancelled.');
    elsif old.shift_name is distinct from new.shift_name
       or old.starts_at is distinct from new.starts_at
       or old.ends_at is distinct from new.ends_at
       or old.notes is distinct from new.notes then
        v_kind := 'schedule_change';
        v_title := 'Schedule updated';
        v_body := concat('The schedule for ', new.shift_name, ' was updated.');

        for v_owner in
            select ur.user_id
            from public.user_roles ur
            join public.profiles p on p.id = ur.user_id
            where ur.role = 'owner'
        loop
            perform private.notify(
                v_owner.user_id,
                'shift',
                'shift_updated',
                v_title,
                v_body,
                new.id,
                null
            );
        end loop;
    else
        return new;
    end if;

    for v_assignment in
        select a.worker_id, a.id
        from public.shift_assignments a
        where a.shift_id = new.id
          and a.response_status in ('pending', 'accepted')
    loop
        perform private.notify(
            v_assignment.worker_id,
            case when v_kind = 'shift_cancelled' then 'cancellation' else 'shift' end,
            v_kind,
            v_title,
            v_body,
            new.id,
            v_assignment.id
        );
    end loop;

    return new;
end;
$$;

create trigger notify_shift_change
after update of shift_name, starts_at, ends_at, notes, status on public.shifts
for each row
execute function private.notify_shift_change();

create or replace function private.notify_new_worker()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_owner record;
    v_worker_name text;
begin
    select trim(concat(p.first_name, ' ', p.last_name))
    into v_worker_name
    from public.profiles p
    where p.id = new.worker_id;

    for v_owner in
        select ur.user_id
        from public.user_roles ur
        join public.profiles p on p.id = ur.user_id
        where ur.role = 'owner'
    loop
        perform private.notify(
            v_owner.user_id,
            'account',
            'worker_added',
            'New worker added',
            concat(v_worker_name, ' was added to the workforce.'),
            null,
            null
        );
    end loop;

    return new;
end;
$$;

-- The queue already handles both new profiles and role changes without duplicates.
create trigger notify_new_worker
after insert on public.worker_priority_queue
for each row
execute function private.notify_new_worker();

revoke all on function private.notify_shift_assignment_event()
from public, anon, authenticated;
revoke all on function private.notify_shift_change()
from public, anon, authenticated;
revoke all on function private.notify_new_worker()
from public, anon, authenticated;
