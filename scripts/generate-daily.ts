import {createClient} from '@supabase/supabase-js';
import {selectDailyQuestions,validateDailyCapacity,type DailyQuestion} from '../lib/daily-generator';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Set Supabase server environment variables');
const db=createClient(url,key);
const {data,error}=await db.from('questions').select('id,question_categories(categories(slug)),question_localizations(locale,translation_status)').eq('status','published').eq('content_rating','clean').eq('daily_eligible',true);
if(error)throw error;
const eligibleRaw=(data||[]).filter((q:any)=>['en','zh-Hant'].every(l=>q.question_localizations.some((x:any)=>x.locale===l&&x.translation_status==='reviewed'));
const eligible:DailyQuestion[]=eligibleRaw.map((q:any)=>({id:q.id,categories:q.question_categories.map((x:any)=>x.categories.slug)}));
validateDailyCapacity(eligible);
const used:string[][]=[];
const start=new Date();
for(let day=0;day<90;day++){
  const date=new Date(start);date.setUTCDate(date.getUTCDate()+day);
  const blocked=new Set(used.slice(-21).flat());
  const chosen=selectDailyQuestions(eligible,blocked);
  const keyDate=date.toISOString().slice(0,10);
  const {data:challenge,error:e}=await db.from('daily_challenges').upsert({challenge_date:keyDate,status:'published'},{onConflict:'challenge_date'}).select('id').single();
  if(e)throw e;
  await db.from('daily_challenge_questions').delete().eq('daily_challenge_id',challenge.id);
  const {error:f}=await db.from('daily_challenge_questions').insert(chosen.map((q,i)=>({daily_challenge_id:challenge.id,question_id:q.id,position:i+1})));
  if(f)throw f;
  used.push(chosen.map(q=>q.id));
}
console.log('Generated 90 UTC daily challenges with a 5/3/2 mix and strict 21-day exclusion.');
