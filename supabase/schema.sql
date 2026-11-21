-- FHV Friends · PostgreSQL / Supabase
-- Run once in a NEW Supabase project's SQL Editor. All data is private to
-- confirmed FHV members; no service-role key belongs in the frontend.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 2 and 80),
 course text not null default '' check(char_length(course)<=100),
 avatar_data text check(avatar_data is null or (char_length(avatar_data)<=120000 and avatar_data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')),
 bio text not null default '' check(char_length(bio)<=400),
 interests text[] not null default '{}' check(cardinality(interests)<=8),
 color text not null default 'blue' check(color in ('blue','yellow','lavender','coral','green')),
 created_at timestamptz not null default now()
);
create table private.user_roles (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 role text not null check(role in ('oh','admin'))
);
create function public.is_fhv_member() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null
 and lower(split_part(email,'@',2)) in ('students.fhv.at','fhv.at'));
$$;
create function public.my_role() returns text language sql stable security definer set search_path = '' as $$
 select case when public.is_fhv_member() then coalesce((select role from private.user_roles where user_id=auth.uid()),'student') else 'student' end;
$$;
revoke all on function public.is_fhv_member(), public.my_role() from public, anon;
grant execute on function public.is_fhv_member(), public.my_role() to authenticated;
create function private.check_fhv_email() returns trigger language plpgsql security definer set search_path = '' as $$
 begin
 if new.email is null or lower(split_part(new.email,'@',2)) not in ('students.fhv.at','fhv.at') then
 raise exception 'Registrierung nur mit FHV-Mailadresse möglich.';
 end if;
 return new;
 end;
$$;
create trigger only_fhv_email before insert or update of email on auth.users for each row execute function private.check_fhv_email();
create function private.new_profile() returns trigger language plpgsql security definer set search_path = '' as $$
 begin
 insert into public.profiles(id,name) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Campus-Mitglied'),80));
 return new;
 end;
$$;
create trigger create_profile after insert on auth.users for each row execute function private.new_profile();

create table public.posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 type text not null check(type in ('activity','trade','food','help','life')),
 image_data text check(image_data is null or (char_length(image_data)<=210000 and image_data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')),
 title text not null check(char_length(trim(title)) between 4 and 100),
 description text not null check(char_length(trim(description)) between 10 and 3000),
 category text not null default 'Campus' check(category in ('Outdoor','Sport','Food','Kultur','Lernen','Campus')),
 location text not null check(char_length(trim(location)) between 1 and 150),
 starts_at timestamptz,
 capacity integer check(capacity between 2 and 500),
 price numeric(10,2) not null default 0 check(price between 0 and 10000),
 help_direction text check(help_direction in ('offer','request')),
 pinned boolean not null default false,
 status text not null default 'open' check(status in ('open','reserved','closed')),
 likes integer not null default 0 check(likes>=0),
 created_at timestamptz not null default now(),
 check(type<>'activity' or starts_at is not null)
);
create index posts_feed on public.posts(pinned desc,created_at desc);
create index posts_type_date on public.posts(type,starts_at);
create index posts_author on public.posts(author_id);
create function private.guard_post() returns trigger language plpgsql security definer set search_path = '' as $$
 begin
 if current_user in ('postgres','supabase_admin') and auth.uid() is null then return new; end if;
 if tg_op='INSERT' and new.pinned and public.my_role() not in ('oh','admin') then raise exception 'Nur ÖH-Konten können Beiträge anpinnen.'; end if;
 if tg_op='UPDATE' and new.pinned is distinct from old.pinned and public.my_role() not in ('oh','admin') then raise exception 'Nur ÖH-Konten können Beiträge anpinnen.'; end if;
 if (tg_op='INSERT' or (tg_op='UPDATE' and new.starts_at is distinct from old.starts_at)) and new.type='activity' and new.starts_at<=now() then raise exception 'Aktivitäten müssen in der Zukunft liegen.'; end if;
 return new;
 end;
$$;
create trigger guard_post before insert or update on public.posts for each row execute function private.guard_post();
create table public.participants (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(post_id,user_id)
);
create index participants_user on public.participants(user_id);
create table public.bookmarks (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(post_id,user_id)
);
create table public.likes (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 primary key(post_id,user_id)
);
create function private.like_count() returns trigger language plpgsql security definer set search_path = '' as $$
 begin
 if tg_op='INSERT' then update public.posts set likes=likes+1 where id=new.post_id;return new;
 else update public.posts set likes=greatest(0,likes-1) where id=old.post_id;return old;end if;
 end;
$$;
create trigger update_like_count after insert or delete on public.likes for each row execute function private.like_count();
create table public.comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 1000),
 created_at timestamptz not null default now()
);
create index comments_post on public.comments(post_id,created_at);
create table public.invitations (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 unique(post_id,recipient_id),check(sender_id<>recipient_id)
);
create index invitations_recipient on public.invitations(recipient_id,status);
create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title)<=220),
 members uuid[] not null default '{}',
 post_id uuid unique references public.posts(id) on delete cascade,
 dm_key text unique,
 created_at timestamptz not null default now(),
 check((post_id is not null and dm_key is null) or (post_id is null and dm_key is not null and cardinality(members)=2))
);
create table public.messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index messages_conversation on public.messages(conversation_id,created_at);
create table public.reports (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 reporter_id uuid not null references public.profiles(id) on delete cascade,
 reason text not null check(char_length(trim(reason)) between 3 and 500),
 created_at timestamptz not null default now()
);

-- Serialize RSVP updates on the activity row, including capacity checks.
create function public.set_attendance(activity_id uuid,attending boolean) returns void language plpgsql security definer set search_path = '' as $$
 declare p public.posts; n integer;
 begin
 if not public.is_fhv_member() then raise exception 'Bitte mit bestätigter FHV-Mail anmelden.';end if;
 select * into p from public.posts where id=activity_id and type='activity' for update;
 if not found then raise exception 'Aktivität nicht gefunden.';end if;
 if attending then
 if p.starts_at<=now() or p.status='closed' then raise exception 'Diese Aktivität ist beendet.';end if;
 if exists(select 1 from public.participants where post_id=activity_id and user_id=auth.uid()) then return;end if;
 select count(*) into n from public.participants where post_id=activity_id;
 if p.capacity is not null and n>=p.capacity then raise exception 'Diese Aktivität ist ausgebucht.';end if;
 insert into public.participants(post_id,user_id) values(activity_id,auth.uid()) on conflict do nothing;
 else delete from public.participants where post_id=activity_id and user_id=auth.uid();end if;
 end;
$$;
create function public.respond_invitation(invitation_id uuid,response text) returns void language plpgsql security definer set search_path = '' as $$
 declare inv public.invitations;
 begin
 if not public.is_fhv_member() or response not in ('accepted','declined') then raise exception 'Nicht erlaubt.';end if;
 select * into inv from public.invitations where id=invitation_id and recipient_id=auth.uid() for update;
 if not found then raise exception 'Einladung nicht gefunden.';end if;
 if response='accepted' then perform public.set_attendance(inv.post_id,true);end if;
 update public.invitations set status=response where id=invitation_id;
 end;
$$;
create function public.can_read_conversation(conversation_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select public.is_fhv_member() and exists(
 select 1 from public.conversations c where c.id=conversation_id and (
 auth.uid()=any(c.members)
 or exists(select 1 from public.participants p where p.post_id=c.post_id and p.user_id=auth.uid())
 or exists(select 1 from public.posts p where p.id=c.post_id and p.author_id=auth.uid())
 ));
$$;
create function public.start_direct_chat(other_user uuid) returns uuid language plpgsql security definer set search_path = '' as $$
 declare chat_id uuid; key text; names text;
 begin
 if not public.is_fhv_member() or other_user=auth.uid() then raise exception 'Nicht erlaubt.';end if;
 if not exists(select 1 from public.profiles where id=other_user) then raise exception 'Profil nicht gefunden.';end if;
 key:=least(auth.uid()::text,other_user::text)||':'||greatest(auth.uid()::text,other_user::text);
 select string_agg(name,' & ' order by id) into names from public.profiles where id in (auth.uid(),other_user);
 insert into public.conversations(title,members,dm_key) values(left(names,220),array[auth.uid(),other_user],key)
 on conflict(dm_key) do update set dm_key=excluded.dm_key returning id into chat_id;
 return chat_id;
 end;
$$;
create function public.activity_chat(activity_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
 declare chat_id uuid; p public.posts;
 begin
 if not public.is_fhv_member() then raise exception 'Nicht erlaubt.';end if;
 select * into p from public.posts where id=activity_id and type='activity';
 if not found then raise exception 'Aktivität nicht gefunden.';end if;
 if p.author_id<>auth.uid() and not exists(select 1 from public.participants where post_id=activity_id and user_id=auth.uid()) then raise exception 'Tritt zuerst der Aktivität bei.';end if;
 insert into public.conversations(title,post_id) values(p.title,activity_id)
 on conflict(post_id) do update set title=excluded.title returning id into chat_id;
 return chat_id;
 end;
$$;

-- Explicit table permissions; roles and conversation membership are never
-- writable through the client API. Only the bounded RPCs above can change them.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles,public.posts,public.participants,public.bookmarks,public.likes,public.comments,public.invitations,public.conversations,public.messages,public.reports to authenticated;
grant update(name,course,bio,interests,color,avatar_data) on public.profiles to authenticated;
grant insert(author_id,type,title,description,category,location,starts_at,capacity,price,help_direction,pinned,image_data) on public.posts to authenticated;
grant update(title,description,category,location,starts_at,capacity,price,help_direction,pinned,status,image_data) on public.posts to authenticated;
grant delete on public.posts to authenticated;
grant insert,delete on public.bookmarks,public.likes to authenticated;
grant insert(post_id,author_id,body) on public.comments to authenticated;
grant insert(post_id,sender_id,recipient_id) on public.invitations to authenticated;
grant insert(conversation_id,author_id,body) on public.messages to authenticated;
grant insert(post_id,reporter_id,reason) on public.reports to authenticated;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.participants enable row level security;
alter table public.bookmarks enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.invitations enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
create policy profiles_read on public.profiles for select to authenticated using(public.is_fhv_member());
create policy profiles_edit on public.profiles for update to authenticated using(public.is_fhv_member() and id=auth.uid()) with check(id=auth.uid());
create policy posts_read on public.posts for select to authenticated using(public.is_fhv_member());
create policy posts_create on public.posts for insert to authenticated with check(public.is_fhv_member() and author_id=auth.uid());
create policy posts_edit on public.posts for update to authenticated using(public.is_fhv_member() and (author_id=auth.uid() or public.my_role() in ('oh','admin'))) with check(public.is_fhv_member() and (author_id=auth.uid() or public.my_role() in ('oh','admin')));
create policy posts_delete on public.posts for delete to authenticated using(public.is_fhv_member() and (author_id=auth.uid() or public.my_role()='admin'));
create policy participants_read on public.participants for select to authenticated using(public.is_fhv_member());
create policy bookmarks_own on public.bookmarks for all to authenticated using(public.is_fhv_member() and user_id=auth.uid()) with check(public.is_fhv_member() and user_id=auth.uid());
create policy likes_read on public.likes for select to authenticated using(public.is_fhv_member());
create policy likes_add on public.likes for insert to authenticated with check(public.is_fhv_member() and user_id=auth.uid());
create policy likes_remove on public.likes for delete to authenticated using(public.is_fhv_member() and user_id=auth.uid());
create policy comments_read on public.comments for select to authenticated using(public.is_fhv_member());
create policy comments_create on public.comments for insert to authenticated with check(public.is_fhv_member() and author_id=auth.uid());
create policy invitations_read on public.invitations for select to authenticated using(public.is_fhv_member() and (recipient_id=auth.uid() or sender_id=auth.uid()));
create policy invitations_create on public.invitations for insert to authenticated with check(public.is_fhv_member() and sender_id=auth.uid() and exists(select 1 from public.posts p where p.id=post_id and p.author_id=auth.uid() and p.type='activity'));
create policy conversations_read on public.conversations for select to authenticated using(public.can_read_conversation(id));
create policy messages_read on public.messages for select to authenticated using(public.can_read_conversation(conversation_id));
create policy messages_create on public.messages for insert to authenticated with check(public.is_fhv_member() and author_id=auth.uid() and public.can_read_conversation(conversation_id));
create policy reports_create on public.reports for insert to authenticated with check(public.is_fhv_member() and reporter_id=auth.uid());
create policy reports_read on public.reports for select to authenticated using(public.is_fhv_member() and (reporter_id=auth.uid() or public.my_role()='admin'));

revoke all on function public.set_attendance(uuid,boolean),public.respond_invitation(uuid,text),public.can_read_conversation(uuid),public.start_direct_chat(uuid),public.activity_chat(uuid) from public,anon;
grant execute on function public.set_attendance(uuid,boolean),public.respond_invitation(uuid,text),public.can_read_conversation(uuid),public.start_direct_chat(uuid),public.activity_chat(uuid) to authenticated;
-- Private trigger helpers must not be directly callable by app clients.
revoke all on all functions in schema private from public,anon,authenticated;
commit;

-- Assign a confirmed ÖH account MANUALLY in the SQL Editor (never from the app):
-- insert into private.user_roles(user_id,role)
-- select id,'oh' from auth.users where lower(email)='EXACT_OEH_ADDRESS@students.fhv.at'
-- and email_confirmed_at is not null on conflict(user_id) do update set role='oh';

-- Connections (also available as migration 003 for existing projects).
begin;
create table if not exists public.connections (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 check(sender_id<>recipient_id)
);
create unique index if not exists connections_pair on public.connections(least(sender_id,recipient_id),greatest(sender_id,recipient_id));
alter table public.connections enable row level security;
revoke all on public.connections from anon,authenticated;
grant select,delete on public.connections to authenticated;
create policy connections_read on public.connections for select to authenticated using(public.is_fhv_member() and auth.uid() in(sender_id,recipient_id));
create policy connections_remove on public.connections for delete to authenticated using(public.is_fhv_member() and auth.uid() in(sender_id,recipient_id));
create or replace function public.request_connection(other_user uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not public.is_fhv_member() or other_user=auth.uid() then raise exception 'Not allowed'; end if;
 if not exists(select 1 from auth.users u where u.id=other_user and u.email_confirmed_at is not null and split_part(lower(u.email),'@',2) in('fhv.at','students.fhv.at')) then raise exception 'Unknown member'; end if;
 insert into public.connections(sender_id,recipient_id) values(auth.uid(),other_user) on conflict do nothing returning id into result;
 if result is null then select id into result from public.connections where least(sender_id,recipient_id)=least(auth.uid(),other_user) and greatest(sender_id,recipient_id)=greatest(auth.uid(),other_user); end if;
 return result;
end;$$;
create or replace function public.respond_connection(connection_id uuid,accept boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_fhv_member() then raise exception 'Not allowed'; end if;
 if accept then update public.connections set status='accepted' where id=connection_id and recipient_id=auth.uid() and status='pending';
 else delete from public.connections where id=connection_id and recipient_id=auth.uid() and status='pending'; end if;
end;$$;
revoke all on function public.request_connection(uuid),public.respond_connection(uuid,boolean) from public,anon;
grant execute on function public.request_connection(uuid),public.respond_connection(uuid,boolean) to authenticated;
commit;

-- Carpool offers, also available as migration 004.
begin;
alter table public.posts add column if not exists ride_destination text check(ride_destination is null or char_length(trim(ride_destination)) between 1 and 150);
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check check(category in ('Outdoor','Sport','Food','Kultur','Lernen','Campus','Mitfahren'));
alter table public.posts drop constraint if exists posts_capacity_check;
alter table public.posts add constraint posts_capacity_check check(capacity between 1 and 500);
alter table public.posts add constraint posts_ride_check check(category<>'Mitfahren' or (type='activity' and ride_destination is not null and capacity is not null and capacity between 1 and 8));
grant insert(ride_destination),update(ride_destination) on public.posts to authenticated;
commit;
