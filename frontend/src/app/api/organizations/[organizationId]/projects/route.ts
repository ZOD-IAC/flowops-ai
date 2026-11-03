import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';

type Context = {
  params: Promise<{ organizationId: string }>;
};

const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().default(''),
});

function validId(value: string) {
  return /^[1-9]\d*$/.test(value);
}

export async function GET(request: NextRequest, { params }: Context) {
  const { organizationId } = await params;

  if (!validId(organizationId)) {
    return NextResponse.json(
      { detail: 'Invalid organization ID' },
      { status: 400 },
    );
  }

  const access = await getAccessToken();

  if (!access) {
    return NextResponse.json(
      { detail: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const page = request.nextUrl.searchParams.get('page');

    const query = page && /^[1-9]\d*$/.test(page) ? `?page=${page}` : '';

    const response = await djangoFetch(
      `/api/organizations/${organizationId}/projects/${query}`,
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Unable to load projects' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const { organizationId } = await params;

  if (!validId(organizationId)) {
    return NextResponse.json(
      { detail: 'Invalid organization ID' },
      { status: 400 },
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
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { detail: 'Invalid project information' },
      { status: 400 },
    );
  }

  try {
    const response = await djangoFetch(
      `/api/organizations/${organizationId}/projects/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(parsed.data),
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: 'Unable to create project' },
      { status: 502 },
    );
  }
}
