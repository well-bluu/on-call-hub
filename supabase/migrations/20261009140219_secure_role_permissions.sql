alter table public.role_permissions enable row level security;

revoke all
on table public.role_permissions
from anon, authenticated, public;
