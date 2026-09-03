import {readFile} from 'node:fs/promises';
import {productionQuestionCandidates} from '../data/questions/production-additions';
import {validateQuestions} from '../lib/validation';
import {MIN_CAPACITY} from '../lib/daily-generator';

type Q={
  id:string;
  canonicalKey:string;
  categories:string[];
  dailyEligible:boolean;
  status:string;
  localizations:Record<string,{a:string;b:string;status:string}>;
};

async function main(){
  const base=JSON.parse(await readFile('data/questions/questions.json','utf8')) as Q[];
  const candidates=productionQuestionCandidates as Q[];
  const all=[...base,...candidates];
  const errors=validateQuestions(all);

  const ids=new Set<string>();
  for(const [index,q] of all.entries()){
    if(ids.has(q.id))errors.push(`Question ${index+1}: duplicate id ${q.id}`);
    ids.add(q.id);
  }

  if(candidates.length!==300)errors.push(`Expected 300 production candidates, found ${candidates.length}`);
  if(candidates.some(q=>q.status!=='draft'))errors.push('Production candidates must remain draft until explicit review approval.');
  if(candidates.some(q=>Object.values(q.localizations).some(t=>t.status!=='draft')))errors.push('Production candidate localizations must remain draft until explicit review approval.');

  const counts=Object.fromEntries(['general','funny','hard','couples'].map(slug=>[
    slug,
    all.filter(q=>q.categories.includes(slug)).length
  ]));
  const dailyCounts=Object.fromEntries(['general','funny','hard'].map(slug=>[
    slug,
    all.filter(q=>q.dailyEligible&&q.categories.includes(slug)).length
  ]));

  const targets={general:120,funny:80,hard:60,couples:80};
  for(const [slug,min] of Object.entries(targets)){
    if((counts[slug]??0)<min)errors.push(`${slug} production target ${min} not met; found ${counts[slug]??0}`);
  }
  for(const [slug,min] of Object.entries(MIN_CAPACITY)){
    if((dailyCounts[slug]??0)<min)errors.push(`${slug} Daily 21-day capacity ${min} not met; found ${dailyCounts[slug]??0}`);
  }

  console.log(`Base reviewed inventory: ${base.length}`);
  console.log(`New bilingual draft candidates: ${candidates.length}`);
  console.log(`Combined inventory: ${all.length}`);
  console.log('Category counts:',counts);
  console.log('Daily-eligible counts:',dailyCounts);

  if(errors.length){
    console.error('\nInventory audit failed:\n'+errors.map(x=>`- ${x}`).join('\n'));
    process.exitCode=1;
    return;
  }
  console.log('\nInventory audit passed. Candidates are structurally production-ready but remain draft pending editorial approval.');
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
