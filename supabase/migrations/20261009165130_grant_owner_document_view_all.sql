insert into public.role_permissions (role, permission)
values ('owner', 'document.view.all')
on conflict (role, permission) do nothing;
