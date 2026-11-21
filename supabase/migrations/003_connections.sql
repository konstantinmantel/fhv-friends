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
