import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. El guardia busca la llave (cookie) en el bolsillo del usuario
  const token = request.cookies.get('token')?.value;

  // 2. Si alguien quiere entrar a /chat pero NO tiene llave, lo devuelve a la entrada (/)
  if (request.nextUrl.pathname.startsWith('/chat') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Si alguien ya tiene la llave y va a la entrada (/), lo pasamos directo al /chat
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Si todo está en orden, lo deja pasar
  return NextResponse.next();
}

// Aquí le decimos al guardia qué puertas debe vigilar exactamente
export const config = {
  matcher: ['/', '/chat/:path*'],
};