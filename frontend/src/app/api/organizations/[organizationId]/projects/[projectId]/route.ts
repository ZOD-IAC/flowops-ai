import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';

type Context = {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
};

const projectSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().optional(),
  })
  .strict();

function validId(id: string) {
  return /^[1-9]\d*$/.test(id);
}

async function forward(
  request: NextRequest,
  context: Context,
  method: 'GET' | 'PATCH' | 'DELETE',
) {
  if (method !== 'GET' && !isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const { organizationId, projectId } = await context.params;

  if (!validId(organizationId) || !validId(projectId)) {
    return NextResponse.json(
      { detail: 'Invalid resource ID' },
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

  let body: string | undefined;

  if (method === 'PATCH') {
    let raw: unknown;

    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { detail: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const parsed = projectSchema.safeParse(raw);

    if (!parsed.success || !Object.keys(parsed.data ?? {}).length) {
      return NextResponse.json(
        { detail: 'Invalid project information' },
        { status: 400 },
      );
    }

    body = JSON.stringify(parsed.data);
  }

  try {
    const response = await djangoFetch(
      `/api/organizations/${organizationId}/projects/${projectId}/`,
      {
        method,
        headers: {
          Authorization: `Bearer ${access}`,
        },
        ...(body ? { body } : {}),
      },
    );

    // Django returns 204 No Content after deletion.
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Unable to process project request' },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: Context) {
  return forward(request, context, 'GET');
}

export async function PATCH(request: NextRequest, context: Context) {
  return forward(request, context, 'PATCH');
}

export async function DELETE(request: NextRequest, context: Context) {
  return forward(request, context, 'DELETE');
}
