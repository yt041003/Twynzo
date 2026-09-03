export type DailyQuestion={id:string;categories:string[]};
export const DAILY_MIX={general:5,funny:3,hard:2} as const;
export const MIN_CAPACITY={general:110,funny:66,hard:44} as const;

export function validateDailyCapacity(items:DailyQuestion[]){
  for(const [slug,min] of Object.entries(MIN_CAPACITY)){
    const count=items.filter(q=>q.categories.includes(slug)).length;
    if(count<min)throw new Error(`Daily generation failed: ${slug} requires at least ${min} available unique questions for a strict 21-day exclusion. Found: ${count}.`);
  }
}

export function selectDailyQuestions(items:DailyQuestion[],blocked:Set<string>){
  const selected:DailyQuestion[]=[];
  const selectedToday=new Set<string>();
  const pick=(slug:keyof typeof DAILY_MIX,n:number)=>{
    const pool=items.filter(q=>!blocked.has(q.id)&&!selectedToday.has(q.id)&&q.categories.includes(slug));
    if(pool.length<n)throw new Error(`Daily generation failed: not enough unique ${slug} questions after applying the 21-day exclusion. Needed ${n}, found ${pool.length}.`);
    const chosen=pool.slice(0,n);
    for(const q of chosen){selected.push(q);selectedToday.add(q.id)}
  };
  pick('general',DAILY_MIX.general);
  pick('funny',DAILY_MIX.funny);
  pick('hard',DAILY_MIX.hard);
  if(selected.length!==10||selectedToday.size!==10)throw new Error('Daily generation failed: challenge must contain exactly 10 unique questions.');
  return selected;
}
