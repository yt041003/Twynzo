import data from '@/data/questions/questions.json';
import type {Locale} from './i18n';
export type Deck='general'|'funny'|'hard'|'couples';
export type Question={id:string;canonicalKey:string;categories:string[];difficulty:string;dailyEligible:boolean;status:string;localizations:Record<Locale,{a:string;b:string;status:string}>};
export const questions=data as Question[];
export const forDeck=(deck:Deck)=>questions.filter(q=>q.categories.includes(deck));
export const localized=(q:Question,l:Locale)=>({...q,...q.localizations[l]});
