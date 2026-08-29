import {NextResponse,type NextRequest} from 'next/server';
export function middleware(req:NextRequest){const h=new Headers(req.headers);h.set('x-twynzo-locale',req.nextUrl.pathname.startsWith('/zh-hant')?'zh-Hant':'en');return NextResponse.next({request:{headers:h}})}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
