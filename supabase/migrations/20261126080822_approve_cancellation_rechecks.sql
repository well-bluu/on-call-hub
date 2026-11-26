-- OCH-211: only approve a cancellation that still applies.
create or replace function private.approve_cancellation_request(p_request_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_assignment_id uuid;
    v_shift_id uuid;
    v_worker_id uuid;
    v_request_status text;
    v_required integer;
    v_shift_status text;
    v_starts_at timestamptz;
    v_shift_name text;
    v_accepted integer;
begin
    if not private.authorize('cancellation.approve') then
        raise exception 'You are not allowed to approve cancellations' using errcode = '42501';
    end if;

    select assignment_id, shift_id, worker_id, status
    into v_assignment_id, v_shift_id, v_worker_id, v_request_status
    from public.emergency_cancellation_requests
    where id = p_request_id
    for update;

    if v_assignment_id is null then
        raise exception 'Cancellation request not found' using errcode = 'P0002';
    end if;

    if v_request_status <> 'pending' then
        raise exception 'This request was already %', v_request_status using errcode = 'P0001';
    end if;

    select required_workers, status, starts_at, shift_name
    into v_required, v_shift_status, v_starts_at, v_shift_name
    from public.shifts
    where id = v_shift_id
    for update;

    if v_shift_status not in ('open', 'filled') then
        raise exception 'This shift is % and can no longer be changed', v_shift_status using errcode = 'P0001';
    end if;

    update public.shift_assignments
    set response_status = 'cancelled',
        responded_at = now()
    where id = v_assignment_id
      and response_status = 'accepted';

    -- Lock waits can carry approval past the start time. Raising rolls back the update.
    if v_starts_at <= clock_timestamp() then
        raise exception 'This shift has already started' using errcode = 'P0001';
    end if;

    if not found then
        raise exception 'This worker is no longer on this shift' using errcode = 'P0001';
    end if;

    update public.emergency_cancellation_requests
    set status = 'approved',
        review_note = nullif(trim(p_note), ''),
        reviewed_by = (select auth.uid()),
        reviewed_at = now()
    where id = p_request_id;

    select count(*) into v_accepted
    from public.shift_assignments
    where shift_id = v_shift_id
      and response_status = 'accepted';

    if v_accepted < v_required and v_shift_status = 'filled' then
        update public.shifts
        set status = 'open'
        where id = v_shift_id
          and status = 'filled';
    end if;

    perform private.offer_next_eligible_worker(v_shift_id);

    perform private.notify(
        v_worker_id,
        'cancellation',
        'cancellation_approved',
        'Cancellation approved',
        concat('Your cancellation for ', v_shift_name, ' was approved.'),
        v_shift_id,
        v_assignment_id
    );
end;
$$;
