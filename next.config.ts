import type { NextConfig } from 'next';
const config: NextConfig={trailingSlash:true,async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'Content-Security-Policy',value:"frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}]}]},async redirects(){return [{source:'/:path*',has:[{type:'host',value:'www.twynzo.com'}],destination:'https://twynzo.com/:path*',permanent:true}]}};
export default config;
