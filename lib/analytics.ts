'use client';
export type EventName='game_start'|'question_view'|'choice_submit'|'result_view'|'next_question'|'deck_change'|'daily_start'|'daily_question_complete'|'daily_complete'|'share_click'|'party_mode_start'|'party_mode_exit'|'language_switch';
export function track(name:EventName,params:Record<string,string|number|boolean|undefined>={}){if(typeof window==='undefined')return;(window as unknown as {gtag?:(...x:unknown[])=>void}).gtag?.('event',name,params)}
