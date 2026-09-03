create or replace function cast_question_vote(
  p_question_id uuid,
  p_anonymous_user_hash text,
  p_choice choice_value,
  p_locale text
)
returns table(option_a_count bigint, option_b_count bigint)
language plpgsql
security definer
set search_path=public
as $$
declare
  old choice_value;
begin
  if not exists(
    select 1 from questions where id=p_question_id and status='published'
  ) or p_locale not in('en','zh-Hant') then
    raise exception 'invalid vote';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_question_id::text,0));

  insert into question_vote_totals(question_id)
  values(p_question_id)
  on conflict do nothing;

  select choice
  into old
  from question_votes
  where question_id=p_question_id
    and anonymous_user_hash=p_anonymous_user_hash
  for update;

  if old is null then
    insert into question_votes(question_id,anonymous_user_hash,choice,locale)
    values(p_question_id,p_anonymous_user_hash,p_choice,p_locale);
  elsif old<>p_choice then
    update question_votes
    set choice=p_choice, locale=p_locale, updated_at=now()
    where question_id=p_question_id
      and anonymous_user_hash=p_anonymous_user_hash;
  end if;

  if old is null then
    update question_vote_totals as t
    set option_a_count=t.option_a_count+(p_choice='A')::int,
        option_b_count=t.option_b_count+(p_choice='B')::int,
        updated_at=now()
    where t.question_id=p_question_id;
  elsif old<>p_choice then
    update question_vote_totals as t
    set option_a_count=greatest(0,t.option_a_count-(old='A')::int)+(p_choice='A')::int,
        option_b_count=greatest(0,t.option_b_count-(old='B')::int)+(p_choice='B')::int,
        updated_at=now()
    where t.question_id=p_question_id;
  end if;

  return query
  select t.option_a_count,t.option_b_count
  from question_vote_totals as t
  where t.question_id=p_question_id;
end
$$;

revoke all on function cast_question_vote(uuid,text,choice_value,text) from public,anon,authenticated;
grant execute on function cast_question_vote(uuid,text,choice_value,text) to service_role;
