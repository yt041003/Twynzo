import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {validateQuestions} from '../lib/validation';

async function main(){
  const items=JSON.parse(await readFile('data/questions/questions.json','utf8'));
  const errors=validateQuestions(items);
  if(errors.length){
    console.error(errors.join('\n'));
    process.exitCode=1;
    return;
  }

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  const db=createClient(url,key);
  for(const q of items){
    const {error}=await db.from('questions').upsert({
      id:q.id,
      canonical_key:q.canonicalKey,
      status:q.status,
      content_rating:'clean',
      difficulty:q.difficulty,
      daily_eligible:q.dailyEligible,
      quality_score:80,
      last_reviewed_at:new Date().toISOString()
    });
    if(error)throw error;

    for(const [locale,t] of Object.entries(q.localizations) as [string,{a:string;b:string;status:string}][]){
      const {error:e}=await db.from('question_localizations').upsert({
        question_id:q.id,
        locale,
        option_a:t.a,
        option_b:t.b,
        translation_status:t.status
      },{onConflict:'question_id,locale'});
      if(e)throw e;
    }

    const {data:cats,error:categoryError}=await db.from('categories').select('id,slug').in('slug',q.categories);
    if(categoryError)throw categoryError;
    for(const c of cats||[]){
      const {error:e}=await db.from('question_categories').upsert({question_id:q.id,category_id:c.id});
      if(e)throw e;
    }
  }

  console.log(`Imported ${items.length} reviewed bilingual questions.`);
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
