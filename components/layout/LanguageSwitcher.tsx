'use client';
import {usePathname} from 'next/navigation'; import Link from 'next/link'; import type {Locale} from '@/lib/i18n'; import {counterpart} from '@/lib/i18n'; import {track} from '@/lib/analytics';
export default function LanguageSwitcher({locale}:{locale:Locale}){const path=usePathname();return <Link className="font-bold text-sm border-2 rounded-full px-3 py-2" href={counterpart(path,locale)} hrefLang={locale==='en'?'zh-Hant':'en'} onClick={()=>track('language_switch',{locale})}>{locale==='en'?'繁中':'EN'}</Link>}
