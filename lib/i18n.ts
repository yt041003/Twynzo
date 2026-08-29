export const locales=['en','zh-Hant'] as const;
export type Locale=typeof locales[number];
export const isLocale=(x:string):x is Locale=>locales.includes(x as Locale);
export const segment=(l:Locale)=>l==='zh-Hant'?'zh-hant':'en';
export const counterpart=(path:string,l:Locale)=>path.replace(/^\/(en|zh-hant)/,`/${segment(l==='en'?'zh-Hant':'en')}`);
export const copy={en:{tagline:'Pick a side. See what the crowd chose.',play:'Play',questions:'Questions',couples:'Couples',funny:'Funny',hard:'Hard',daily:'Daily',next:'Next Question',or:'OR',votes:'votes',retry:"We couldn't save your vote. Try again.",early:"You’re one of the first people to answer this question.",choose:'What would YOU choose?',predict:'Which option do you think the crowd chose?',share:'Share Result',party:'Party Mode'},'zh-Hant':{tagline:'選一邊，看看大家怎麼選。',play:'玩遊戲',questions:'問題大全',couples:'情侶',funny:'搞笑',hard:'超難',daily:'每日挑戰',next:'下一題',or:'或',votes:'票',retry:'暫時未能記錄你的選擇，請再試一次。',early:'你是最早回答這題的玩家之一。',choose:'你自己會選哪個？',predict:'你猜大多數人會選哪個？',share:'分享結果',party:'派對模式'}} as const;
