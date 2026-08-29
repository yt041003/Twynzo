import {notFound} from 'next/navigation';import SeoPage from '@/components/seo/SeoPage';import {isLocale} from '@/lib/i18n';import {metadata as makeMetadata} from '@/lib/seo';
const slug='hard-would-you-rather' as const;
function locale(raw:string){const l=raw==='zh-hant'?'zh-Hant':raw;if(!isLocale(l))notFound();return l}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){return makeMetadata(locale((await params).locale),slug)}
export default async function Page({params}:{params:Promise<{locale:string}>}){return <SeoPage locale={locale((await params).locale)} slug={slug}/>}
