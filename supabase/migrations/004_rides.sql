begin;
alter table public.posts add column if not exists ride_destination text check(ride_destination is null or char_length(trim(ride_destination)) between 1 and 150);
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check check(category in ('Outdoor','Sport','Food','Kultur','Lernen','Campus','Mitfahren'));
alter table public.posts drop constraint if exists posts_capacity_check;
alter table public.posts add constraint posts_capacity_check check(capacity between 1 and 500);
alter table public.posts add constraint posts_ride_check check(category<>'Mitfahren' or (type='activity' and ride_destination is not null and capacity is not null and capacity between 1 and 8));
grant insert(ride_destination),update(ride_destination) on public.posts to authenticated;
commit;
