-- OCH-209: a worker's photo path must be inside their own folder.
alter table public.profiles
add constraint profiles_avatar_path_own_folder
check (avatar_path is null or split_part(avatar_path, '/', 1) = id::text);