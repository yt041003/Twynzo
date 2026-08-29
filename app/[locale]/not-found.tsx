import Link from 'next/link';
import {headers} from 'next/headers';

export default async function NotFound(){const path=(await headers()).get('x-invoke-path')||'';const zh=path.startsWith('/zh-hant');return <main className="min-h-screen grid place-items-center p-5 text-center"><div><div className="wordmark">Twynzo</div><h1 className="mt-6">{zh?'這個選項好像不存在。':'Looks like this choice doesn’t exist.'}</h1><Link className="btn mt-8" href={zh?'/zh-hant/would-you-rather/':'/en/would-you-rather/'}>{zh?'開始玩「你寧願」':'Play Would You Rather'}</Link></div></main>}
