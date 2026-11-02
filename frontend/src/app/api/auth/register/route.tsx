import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import { isSameOrigin } from '@/lib/auth/origin';

const registerSchema = z
  .object({
    username: z.string().trim().min(3).max(150),
    email: z.email(),
    password: z.string().min(8),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { detail: 'Invalid registration details' },
      { status: 400 },
    );
  }

  try {
    const { password_confirm, ...registrationData } = parsed.data;
    void password_confirm;

    const response = await djangoFetch('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(result, {
        status: response.status,
      });
    }

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { detail: 'Registration service unavailable' },
      { status: 503 },
    );
  }
}
