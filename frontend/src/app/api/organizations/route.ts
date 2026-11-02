import { NextRequest, NextResponse } from 'next/server';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';

export async function GET() {
  const access = await getAccessToken();

  if (!access) {
    return NextResponse.json(
      { detail: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const response = await djangoFetch('/api/organizations/', {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: 'Unable to load organizations' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const access = await getAccessToken();

  if (!access) {
    return NextResponse.json(
      { detail: 'Authentication required' },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('name' in body) ||
    !('slug' in body) ||
    typeof body.name !== 'string' ||
    typeof body.slug !== 'string'
  ) {
    return NextResponse.json(
      { detail: 'Name and slug are required' },
      { status: 400 },
    );
  }

  try {
    const response = await djangoFetch('/api/organization/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({
        name: body.name.trim(),
        slug: body.slug.trim(),
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: 'Unable to create organization' },
      { status: 502 },
    );
  }
}
