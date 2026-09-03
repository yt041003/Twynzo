import {createClient} from '@supabase/supabase-js';
import {selectDailyQuestions,validateDailyCapacity,type DailyQuestion} from '../lib/daily-generator';

async function main(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error('Set Supabase server environment variables');

  const db=createClient(url,key);
  const {data,error}=await db.from('questions').select('id,question_categories(categories(slug)),question_localizations(locale,translation_status)').eq('status','published').eq('content_rating','clean').eq('daily_eligible',true);
  if(error)throw error;

  const eligibleRaw=(data||[]).filter((q:any)=>['en','zh-Hant'].every(l=>q.question_localizations.some((x:any)=>x.locale===l&&x.translation_status==='reviewed')));
  const eligible:DailyQuestion[]=eligibleRaw.map((q:any)=>({id:q.id,categories:q.question_categories.map((x:any)=>x.categories.slug)}));
  validateDailyCapacity(eligible);
  const eligibleById=new Map(eligible.map(q=>[q.id,q]));

  const start=new Date(),end=new Date(start),historyStart=new Date(start);
  end.setUTCDate(end.getUTCDate()+89);
  historyStart.setUTCDate(historyStart.getUTCDate()-21);
  const startKey=start.toISOString().slice(0,10),endKey=end.toISOString().slice(0,10),historyKey=historyStart.toISOString().slice(0,10);
  const {data:existing,error:existingError}=await db.from('daily_challenges').select('id,challenge_date,status,daily_challenge_questions(question_id,position)').eq('status','published').gte('challenge_date',historyKey).lte('challenge_date',endKey).order('challenge_date');
  if(existingError)throw existingError;

  const scheduled=new Map<string,string[]>();
  for(const row of existing||[]){
    const ids=(row.daily_challenge_questions as any[]).slice().sort((a,b)=>a.position-b.position).map(x=>x.question_id as string);
    if(ids.length!==10||new Set(ids).size!==10)throw new Error(`Daily generation failed: existing published challenge ${row.challenge_date} is malformed.`);
    scheduled.set(row.challenge_date,ids);
  }

  const used:string[][]=[];
  for(const row of existing||[]){
    if(row.challenge_date<startKey){
      const ids=scheduled.get(row.challenge_date)!;
      used.push(ids);
    }
  }

  for(let day=0;day<90;day++){
    const date=new Date(start);
    date.setUTCDate(date.getUTCDate()+day);
    const keyDate=date.toISOString().slice(0,10),blocked=new Set(used.slice(-21).flat()),already=scheduled.get(keyDate);
    if(already){
      if(already.some(id=>blocked.has(id)))throw new Error(`Daily generation failed: existing published challenge ${keyDate} violates the 21-day exclusion.`);
      if(already.some(id=>!eligibleById.has(id)))throw new Error(`Daily generation failed: existing published challenge ${keyDate} contains an ineligible question.`);
      used.push(already);
      continue;
    }

    const chosen=selectDailyQuestions(eligible,blocked);
    const {data:challenge,error:e}=await db.from('daily_challenges').upsert({challenge_date:keyDate,status:'published'},{onConflict:'challenge_date'}).select('id').single();
    if(e)throw e;
    const {error:deleteError}=await db.from('daily_challenge_questions').delete().eq('daily_challenge_id',challenge.id);
    if(deleteError)throw deleteError;
    const {error:f}=await db.from('daily_challenge_questions').insert(chosen.map((q,i)=>({daily_challenge_id:challenge.id,question_id:q.id,position:i+1})));
    if(f)throw f;
    used.push(chosen.map(q=>q.id));
  }

  console.log(`Ensured published Daily challenges through ${endKey} with a 5/3/2 mix and strict 21-day exclusion; existing published days were preserved.`);
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
