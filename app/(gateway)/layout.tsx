import '@/app/globals.css';
import type {Metadata} from 'next';
import Analytics from '@/components/analytics/Analytics';
import {SITE} from '@/lib/site';

export const metadata:Metadata={metadataBase:new URL(SITE),title:{default:'Twynzo',template:'%s'},description:'Pick a side. See what the crowd chose.',icons:{icon:'/favicon.svg'}};

export default function GatewayLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}<Analytics/></body></html>;
}
