create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_number bigint generated always as identity unique not null,
  first_name text not null,
  last_name text not null,
  phone_number text,
  avatar_path text,
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_account_status_check
    check (account_status in ('active', 'inactive'))
);

alter table public.profiles enable row level security;