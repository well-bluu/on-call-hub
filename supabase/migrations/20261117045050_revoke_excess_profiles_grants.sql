revoke all on table public.profiles from anon, public;
revoke truncate, references, trigger on table public.profiles from authenticated;

grant select, insert, update on table public.profiles to authenticated;
