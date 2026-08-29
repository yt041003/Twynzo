export type Choice='A'|'B';
export function percentages(a:number,b:number){const total=a+b;return total?{a:a/total*100,b:b/total*100,total}:{a:0,b:0,total:0}}
export function applyVote(a:number,b:number,previous:Choice|null,next:Choice){if(previous===next)return {a,b};if(previous==='A')a=Math.max(0,a-1);if(previous==='B')b=Math.max(0,b-1);if(next==='A')a++;else b++;return {a,b}}
export function benchmark(a:number,b:number){if(a===0&&b===0||a===b)return {scoreable:false,choice:null};return {scoreable:true,choice:(a>b?'A':'B') as Choice}}
