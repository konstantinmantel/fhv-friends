-- Only for projects where the previous version of schema.sql is already installed.
-- New projects use schema.sql, which includes these columns.
begin;
alter table public.profiles add column if not exists avatar_data text check(avatar_data is null or (char_length(avatar_data)<=120000 and avatar_data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$'));
alter table public.posts add column if not exists image_data text check(image_data is null or (char_length(image_data)<=210000 and image_data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$'));
grant update(avatar_data) on public.profiles to authenticated;
grant insert(image_data),update(image_data) on public.posts to authenticated;
commit;
