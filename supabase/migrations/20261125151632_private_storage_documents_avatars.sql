insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('worker-documents', 'worker-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create table public.worker_documents (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text not null unique,
  uploaded_at timestamptz not null default now(),
  constraint worker_documents_type_check
    check (document_type in ('nbi_clearance', 'medical_certificate', 'philhealth', 'other')),
  constraint worker_documents_file_name_check check (length(trim(file_name)) between 1 and 255),
  constraint worker_documents_path_owner_check check (split_part(storage_path, '/', 1) = worker_id::text)
);

comment on table public.worker_documents is
  'Metadata for files in the private worker-documents bucket. Path = <worker_id>/<file>.';

alter table public.worker_documents enable row level security;
create index worker_documents_worker_uploaded_idx on public.worker_documents (worker_id, uploaded_at desc);

revoke all on table public.worker_documents from anon, authenticated, public;
grant select, insert, delete on table public.worker_documents to authenticated;

create policy "Workers can view their own documents"
on public.worker_documents for select to authenticated
using (
  worker_id = (select auth.uid())
  and (select private.authorize('document.view.own'))
);

create policy "Owners can view all worker documents"
on public.worker_documents for select to authenticated
using (
  (select private.authorize('document.view.all'))
);

create policy "Workers can add their own documents"
on public.worker_documents for insert to authenticated
with check (
  worker_id = (select auth.uid())
  and (select private.authorize('document.upload.own'))
);

create policy "Workers can delete their own documents"
on public.worker_documents for delete to authenticated
using (
  worker_id = (select auth.uid())
  and (select private.authorize('document.upload.own'))
);

create policy "Workers upload files to their own document folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.authorize('document.upload.own'))
);

create policy "Workers read files in their own document folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.authorize('document.view.own'))
);

create policy "Owners read all worker document files"
on storage.objects for select to authenticated
using (
  bucket_id = 'worker-documents'
  and (select private.authorize('document.view.all'))
);

create policy "Workers delete files in their own document folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.authorize('document.upload.own'))
);

create policy "Users upload their own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.authorize('profile.update.own'))
);

create policy "Users replace their own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users read their own avatar"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners read worker avatars"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (select private.authorize('worker.view'))
);

create policy "Users delete their own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
