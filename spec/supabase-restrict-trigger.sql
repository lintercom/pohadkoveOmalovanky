-- Applied as restrict_rls_trigger_execution to the remote project.
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
