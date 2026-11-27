-- OCH-213: a new shift must start in the future.
create or replace function private.reject_past_shift()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.starts_at <= now() then
    raise exception 'A shift cannot start in the past' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_past_shift on public.shifts;

create trigger reject_past_shift
before insert on public.shifts
for each row
execute function private.reject_past_shift();