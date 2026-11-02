import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import { createSession } from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';
import type { TokenPair } from '@/features/auth/types';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const tokenSchema = z.object({
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

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { detail: 'Invalid login credential ' },
      { status: 400 },
    );
  }

  try {
    const response = await djangoFetch('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: 'Invalid username or password' },
        { status: 401 },
      );
    }

    const result = tokenSchema.safeParse(await response.json());

    if (!result.success) {
      return NextResponse.json(
        { detail: 'Unexpected authentication response' },
        { status: 502 },
      );
    }

    const token: TokenPair = result.data;
    await createSession(token);

    return NextResponse.json({
      message: 'Login Successful',
    });
  } catch {
    return NextResponse.json(
      { detail: 'Authentication service unavailable' },
      { status: 503 },
    );
  }
}
