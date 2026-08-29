import './globals.css';import type {Metadata} from 'next';import {headers} from 'next/headers';import {SITE} from '@/lib/site';import Analytics from '@/components/analytics/Analytics';
export const metadata:Metadata={metadataBase:new URL(SITE),title:{default:'Twynzo',template:'%s'},description:'Pick a side. See what the crowd chose.',icons:{icon:'/favicon.svg'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const lang=(await headers()).get('x-twynzo-locale')||'en';return <html lang={lang}><body>{children}<Analytics/></body></html>}
