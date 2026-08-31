import {createClient} from '@supabase/supabase-js';
import {selectDailyQuestions,type DailyQuestion} from '../lib/daily-generator';

async function main(){
  if(process.env.TWYNZO_ALLOW_STAGING_SEED!=='true'){
    throw new Error('Refusing to seed Daily without TWYNZO_ALLOW_STAGING_SEED=true');
  }

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  const date=process.env.STAGING_DAILY_DATE||new Date().toISOString().slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('STAGING_DAILY_DATE must be YYYY-MM-DD');

  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db
    .from('questions')
    .select('id,question_categories(categories(slug)),question_localizations(locale,translation_status)')
    .eq('status','published')
    .eq('content_rating','clean')
    .eq('daily_eligible',true);
  if(error)throw error;

  const eligibleRaw=(data||[]).filter((q:any)=>
    ['en','zh-Hant'].every(locale=>q.question_localizations.some((x:any)=>x.locale===locale&&x.translation_status==='reviewed'))
  );
  const eligible:DailyQuestion[]=eligibleRaw.map((q:any)=>({
    id:q.id,
    categories:q.question_categories.map((x:any)=>x.categories.slug)
  }));

  const chosen=selectDailyQuestions(eligible,new Set());
  if(chosen.length!==10||new Set(chosen.map(q=>q.id)).size!==10){
    throw new Error('Staging Daily seed did not produce exactly 10 unique questions');
  }

  const {data:challenge,error:challengeError}=await db
    .from('daily_challenges')
    .upsert({challenge_date:date,status:'published'},{onConflict:'challenge_date'})
    .select('id')
    .single();
  if(challengeError)throw challengeError;

  const {error:deleteError}=await db
    .from('daily_challenge_questions')
    .delete()
    .eq('daily_challenge_id',challenge.id);
  if(deleteError)throw deleteError;

  const {error:insertError}=await db
    .from('daily_challenge_questions')
    .insert(chosen.map((q,index)=>({
      daily_challenge_id:challenge.id,
      question_id:q.id,
      position:index+1
    })));
  if(insertError)throw insertError;

  console.log(`Seeded staging Daily ${date} with 10 unique questions (5 General / 3 Funny / 2 Hard).`);
  console.log(chosen.map((q,index)=>`${index+1}. ${q.id} [${q.categories.join(',')}]`).join('\n'));
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
