-- OCH-227: include the shift's day and time (Manila) in shift notifications.
create or replace function private.notify_shift_assignment_event()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
    v_shift_name text;
    v_owner_id uuid;
    v_worker_name text;
    v_when text;
    v_day text;
begin
    select s.shift_name,
           s.created_by,
           to_char(s.starts_at at time zone 'Asia/Manila', 'Dy FMDD Mon, FMHH12:MI AM')
             || '–' || to_char(s.ends_at at time zone 'Asia/Manila', 'FMHH12:MI AM'),
           to_char(s.starts_at at time zone 'Asia/Manila', 'Dy FMDD Mon')
    into v_shift_name, v_owner_id, v_when, v_day
    from public.shifts s
    where s.id = new.shift_id;

    select trim(concat(p.first_name, ' ', p.last_name))
    into v_worker_name
    from public.profiles p
    where p.id = new.worker_id;

    if tg_op = 'INSERT' and new.response_status = 'pending' then
        perform private.notify(
            new.worker_id, 'shift', 'shift_offer', 'New shift offer',
            concat('New offer: ', v_shift_name, ', ', v_when, '. First to accept gets it.'),
            new.shift_id, new.id
        );
    elsif tg_op = 'UPDATE' and old.response_status is distinct from new.response_status then
        if new.response_status = 'accepted' then
            perform private.notify(
                new.worker_id, 'shift', 'shift_confirmation', 'Shift confirmed',
                concat('You''re booked: ', v_shift_name, ', ', v_when, '.'),
                new.shift_id, new.id
            );
            perform private.notify(
                v_owner_id, 'shift', 'worker_accepted', 'Worker accepted a shift',
                concat(coalesce(v_worker_name, 'A worker'), ' accepted ', v_shift_name, ' (', v_day, ').'),
                new.shift_id, new.id
            );
        elsif new.response_status = 'declined' then
            perform private.notify(
                v_owner_id, 'shift', 'worker_declined', 'Worker declined a shift',
                concat(coalesce(v_worker_name, 'A worker'), ' declined ', v_shift_name, ' (', v_day, ').'),
                new.shift_id, new.id
            );
        elsif old.response_status = 'accepted' and new.response_status = 'cancelled' then
            if (select auth.uid()) = new.worker_id then
                perform private.notify(
                    new.worker_id, 'cancellation', 'cancellation_confirmed', 'Cancellation confirmed',
                    concat('Your cancellation for ', v_shift_name, ' (', v_day, ') was confirmed.'),
                    new.shift_id, new.id
                );
                perform private.notify(
                    v_owner_id, 'cancellation', 'cancellation_request', 'Worker cancelled a shift',
                    concat(coalesce(v_worker_name, 'A worker'), ' cancelled ', v_shift_name, ' (', v_day, ').'),
                    new.shift_id, new.id
                );
            end if;
        end if;
    end if;

    return new;
end;
$function$;
