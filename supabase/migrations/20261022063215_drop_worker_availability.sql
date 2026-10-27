-- Worker availability was dropped as redundant (team decision 2026-10-21).

-- Drops the table with its policies, grants and trigger
drop table if exists public.worker_availability;

-- Stop granting the availability permissions
delete from public.role_permissions
where permission in (
  'availability.view.own',
  'availability.update.own',
  'availability.view.all'
);
