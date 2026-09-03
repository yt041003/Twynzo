export const features={
  daily:process.env.NEXT_PUBLIC_DAILY_ENABLED!=='false',
  party:process.env.NEXT_PUBLIC_PARTY_ENABLED!=='false',
} as const;
