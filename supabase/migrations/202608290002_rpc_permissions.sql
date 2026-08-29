revoke all on function public.cast_question_vote(uuid,text,choice_value,text) from public,anon,authenticated;
grant execute on function public.cast_question_vote(uuid,text,choice_value,text) to service_role;

revoke all on function public.submit_daily_prediction(date,uuid,text,choice_value,choice_value,text) from public,anon,authenticated;
grant execute on function public.submit_daily_prediction(date,uuid,text,choice_value,choice_value,text) to service_role;
