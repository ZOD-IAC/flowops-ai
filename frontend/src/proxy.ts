import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'flowops_access';
const REFRESH_COOKIE = 'flowops_refresh';

const API_URL = process.env.DJANGO_API_URL;

function isExpired(token: string) {
  try {
    const payload = token.split('.')[1];

    if (!payload) return true;

    const decode = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );

    if (typeof decode.exp !== 'number') return true;

    return decode.exp * 1000 <= Date.now() + 60_000;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (access && !isExpired(access)) {
    return NextResponse.next();
  }

  if (!refresh || !API_URL) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
      cache: 'no-store',
      signal: AbortSignal.timeout(500),
    });

    if (!response.ok) {
      return NextResponse.next();
    }

    const tokens: unknown = await response.json();

    if (
      !tokens ||
      typeof tokens !== 'object' ||
      !('access' in tokens) ||
      !('refresh' in tokens) ||
      typeof tokens.access !== 'string' ||
      typeof tokens.refresh !== 'string'
    ) {
      return NextResponse.next();
    }

    // Make refreshed tokens available to the current request.
    const headers = new Headers(request.headers);

    const cookieHeader = [
      ...request.cookies
        .getAll()
        .filter(
          (cookie) =>
            cookie.name !== ACCESS_COOKIE && cookie.name !== REFRESH_COOKIE,
        )
        .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`),
      `${ACCESS_COOKIE}=${encodeURIComponent(tokens.access)}`,
      `${REFRESH_COOKIE}=${encodeURIComponent(tokens.refresh)}`,
    ].join('; ');

    headers.set('cookie', cookieHeader);

    const nextResponse = NextResponse.next({
      request: { headers },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    nextResponse.cookies.set(ACCESS_COOKIE, tokens.access, {
      ...cookieOptions,
      maxAge: 30 * 60,
    });

    nextResponse.cookies.set(REFRESH_COOKIE, tokens.refresh, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });

    return nextResponse;
  } catch {
    // A temporary backend failure should not delete the session.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/organizations/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/settings/:path*',
  ],
};
