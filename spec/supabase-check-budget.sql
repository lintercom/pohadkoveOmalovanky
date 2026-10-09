create table public.story_api_budget (
 id integer primary key check(id=1), minute_started timestamptz not null,
 minute_count integer not null, day_started date not null, day_count integer not null
);
alter table public.story_api_budget enable row level security;
revoke all on public.story_api_budget from public,anon,authenticated;
grant select,insert,update,delete on public.story_api_budget to service_role;
create function public.consume_story_check_budget() returns boolean
language plpgsql security invoker set search_path='' as $$
declare counter integer;
begin
 insert into public.story_api_budget values(1,date_trunc('minute',now()),1,current_date,1)
 on conflict(id) do update set
 minute_started=date_trunc('minute',now()),
 minute_count=case when story_api_budget.minute_started=date_trunc('minute',now()) then story_api_budget.minute_count+1 else 1 end,
 day_started=current_date,
 day_count=case when story_api_budget.day_started=current_date then story_api_budget.day_count+1 else 1 end
 where (story_api_budget.minute_started<>date_trunc('minute',now()) or story_api_budget.minute_count<30)
 and (story_api_budget.day_started<>current_date or story_api_budget.day_count<300)
 returning minute_count into counter;
 return counter is not null;
end $$;
revoke execute on function public.consume_story_check_budget() from public,anon,authenticated;
grant execute on function public.consume_story_check_budget() to service_role;
