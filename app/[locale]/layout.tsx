import '@/app/globals.css';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Analytics from '@/components/analytics/Analytics';
import {isLocale} from '@/lib/i18n';
import {SITE} from '@/lib/site';

export const metadata:Metadata={metadataBase:new URL(SITE),title:{default:'Twynzo',template:'%s'},description:'Pick a side. See what the crowd chose.',icons:{icon:'/favicon.svg'}};
export function generateStaticParams(){return[{locale:'en'},{locale:'zh-hant'}]}
export const dynamicParams=false;

export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const raw=(await params).locale,l=raw==='zh-hant'?'zh-Hant':raw;
  if(!isLocale(l))notFound();
  return <html lang={l}><body><Header locale={l}/>{children}<Footer locale={l}/><Analytics/></body></html>;
}
