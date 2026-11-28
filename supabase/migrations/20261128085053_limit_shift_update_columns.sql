-- OCH-200: status, times and worker count change only through
-- cancel_shift and the offer engine, never by a direct update.
revoke update on public.shifts from authenticated;
grant update (shift_name, notes) on public.shifts to authenticated;
