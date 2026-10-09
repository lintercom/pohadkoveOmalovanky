create function public.verify_story_admin_session(p_user uuid,p_session uuid) returns jsonb
language sql security invoker set search_path='' as $$
 select jsonb_build_object('user_id',a.user_id,'login_name',a.login_name)
 from public.story_admins a join auth.sessions s on s.user_id=a.user_id
 where a.user_id=p_user and a.enabled and s.id=p_session and (s.not_after is null or s.not_after>now());
$$;
revoke execute on function public.verify_story_admin_session(uuid,uuid) from public,anon,authenticated;
grant execute on function public.verify_story_admin_session(uuid,uuid) to service_role;
grant select on auth.sessions to service_role;
create index story_checks_created on public.story_checks(created_at desc);
create index story_checks_outcome_created on public.story_checks(outcome,created_at desc);
