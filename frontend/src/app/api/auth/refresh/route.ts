import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import {
  clearSession,
  createSession,
  getRefreshToken,
} from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';

const refreshSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const refresh = await getRefreshToken();

  if (!refresh) {
    return NextResponse.json({ detail: 'No active session' }, { status: 401 });
  }

  try {
    const response = await djangoFetch('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });

    if (response.status === 401) {
      await clearSession();
      return NextResponse.json({ detail: 'Session Expired' }, { status: 401 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: 'Unable to refresh session' },
        { status: 502 },
      );
    }

    const parsed = refreshSchema.safeParse(await response.json());

    if (!parsed.success) {
      return NextResponse.json(
        { detail: 'Invalid token response' },
        { status: 502 },
      );
    }

    await createSession(parsed.data);

    return NextResponse.json({ message: 'Session Refreshed' });
  } catch {
    return NextResponse.json(
      { detail: 'Authentication service unavailable' },
      { status: 503 },
    );
  }
}
