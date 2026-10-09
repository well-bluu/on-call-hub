alter table public.user_roles enable row level security;

create policy "Auth admin can read user roles"
on public.user_roles
for select
to supabase_auth_admin
using (true);
