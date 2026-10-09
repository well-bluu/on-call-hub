create policy "Owners can view all profiles"
on public.profiles
for select
to authenticated
using ((select private.authorize('worker.view')));
