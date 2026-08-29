import {notFound} from 'next/navigation';import Header from '@/components/layout/Header';import Footer from '@/components/layout/Footer';import {isLocale} from '@/lib/i18n';
export function generateStaticParams(){return[{locale:'en'},{locale:'zh-hant'}]}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const raw=(await params).locale,l=raw==='zh-hant'?'zh-Hant':raw;if(!isLocale(l))notFound();return <div lang={l}><Header locale={l}/>{children}<Footer locale={l}/></div>}
