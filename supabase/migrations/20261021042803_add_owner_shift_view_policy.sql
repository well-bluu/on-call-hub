create policy "Owners can view all shifts"
on public.shifts for select to authenticated
using ( (select private.authorize('shift.view.all'::public.app_permission)) );