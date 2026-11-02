import 'server-only';

import { cookies } from 'next/headers';
import type { TokenPair } from '@/features/auth/types';

const ACCESS_COOKIE = 'flowops_access';
const REFRESH_COOKIE = 'flowops_refreshh';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV == 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function createSession(token: TokenPair) {
  const store = await cookies();

  store.set(ACCESS_COOKIE, token.access, {
    ...cookieOptions,
    maxAge: 30 * 60,
  });

  store.set(REFRESH_COOKIE, token.refresh, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function clearSession() {
  const store = await cookies();

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
