import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {}
//   const role = request.cookies.get('role')?.value;
//   const pathname = request.nextUrl.pathname;

//   const isAdminPage = pathname.startsWith('/admin');
//   const isCreatorPage = pathname.startsWith('/creator');

//   if (!isAdminPage && !isCreatorPage) {
//     return NextResponse.next();
//   }

//   if (!role) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   if (isAdminPage && role !== 'Admin') {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   if (isCreatorPage && role !== 'Creator') {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*', '/creator/:path*'],
// };
