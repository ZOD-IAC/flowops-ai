import { NextRequest, NextResponse } from 'next/server';

import { djangoFetch } from '@/lib/api/server';
import { isSameOrigin } from '@/lib/auth/origin';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const access = await getAccessToken();
  const refresh = await getRefreshToken();

  if (refresh) {
    try {
      await djangoFetch('/api/auth/logout/', {
        method: 'POST',
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Clear browser cookies even if Django is unavailable.
    }
  }

  await clearSession();

  return NextResponse.json({
    message: 'Logged out',
  });
}
