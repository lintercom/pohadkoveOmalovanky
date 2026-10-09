create table public.story_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 login_name text not null unique, enabled boolean not null default true
);
create table public.story_admin_notes (
 order_id uuid primary key references public.story_orders(id),
 note text not null check(length(note)<=2000),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id)
);
create table public.story_admin_settings (
 id integer primary key check(id=1),
 minute_limit integer not null check(minute_limit between 1 and 100),
 day_limit integer not null check(day_limit between 1 and 3000),
 updated_at timestamptz not null default now()
);
insert into public.story_admin_settings(id,minute_limit,day_limit) values(1,30,300);
alter table public.story_admins enable row level security;
alter table public.story_admin_notes enable row level security;
alter table public.story_admin_settings enable row level security;
revoke all on public.story_admins,public.story_admin_notes,public.story_admin_settings from public,anon,authenticated;
grant select,insert,update,delete on public.story_admins,public.story_admin_notes,public.story_admin_settings to service_role;
create or replace function public.consume_story_check_budget() returns boolean
language plpgsql security invoker set search_path='' as $$
declare counter integer; limits record;
begin
 select minute_limit,day_limit into strict limits from public.story_admin_settings where id=1;
 insert into public.story_api_budget values(1,date_trunc('minute',now()),1,current_date,1)
 on conflict(id) do update set
 minute_started=date_trunc('minute',now()),
 minute_count=case when story_api_budget.minute_started=date_trunc('minute',now()) then story_api_budget.minute_count+1 else 1 end,
 day_started=current_date,
 day_count=case when story_api_budget.day_started=current_date then story_api_budget.day_count+1 else 1 end
 where (story_api_budget.minute_started<>date_trunc('minute',now()) or story_api_budget.minute_count<limits.minute_limit)
 and (story_api_budget.day_started<>current_date or story_api_budget.day_count<limits.day_limit)
 returning minute_count into counter;
 return counter is not null;
end $$;
revoke execute on function public.consume_story_check_budget() from public,anon,authenticated;
grant execute on function public.consume_story_check_budget() to service_role;
create function public.story_admin_overview() returns jsonb
language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'orders',(select count(*) from public.story_orders),
 'ready',(select count(*) from public.story_orders where status='ready'),
 'needs_action',(select count(*) from public.story_orders where status in ('needs_action','refund_pending')),
 'cost_czk',(select coalesce(sum(cost_czk),0) from public.story_orders),
 'checks',(select count(*) from public.story_checks),
 'recent_checks',(select count(*) from public.story_checks where created_at>=now()-interval '24 hours'),
 'today_checks',coalesce((select day_count from public.story_api_budget where id=1 and day_started=current_date),0)
 );
$$;
revoke execute on function public.story_admin_overview() from public,anon,authenticated;
grant execute on function public.story_admin_overview() to service_role;
