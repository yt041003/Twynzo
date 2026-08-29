export const SITE=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'')||'https://twynzo.com';
export const slugs=['would-you-rather','would-you-rather-questions','would-you-rather-for-couples','funny-would-you-rather','hard-would-you-rather'] as const;
export const features={ads:process.env.NEXT_PUBLIC_ADS_ENABLED==='true',daily:process.env.NEXT_PUBLIC_DAILY_ENABLED!=='false',party:process.env.NEXT_PUBLIC_PARTY_ENABLED!=='false',analytics:Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)};
