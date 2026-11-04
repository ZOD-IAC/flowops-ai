import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';
import { isSameOrigin } from '@/lib/auth/origin';

type Context = {
  params: Promise<{
    organizationId: string;
    projectId: string;
    taskId: string;
  }>;
};

const taskUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    assignee: z.number().int().positive().nullable().optional(),
    due_date: z.iso.date().nullable().optional(),
  })
  .strict();

async function forward(
  request: NextRequest,
  context: Context,
  method: 'PATCH' | 'DELETE',
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { detail: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const { organizationId, projectId, taskId } = await context.params;

  if (
    ![organizationId, projectId, taskId].every((id) => /^[1-9]\d*$/.test(id))
  ) {
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
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = taskUpdateSchema.safeParse(payload);

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { detail: 'Invalid task update' },
        { status: 400 },
      );
    }

    body = JSON.stringify(parsed.data);
  }

  try {
    const response = await djangoFetch(
      `/api/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}/`,
      {
        method,
        headers: {
          Authorization: `Bearer ${access}`,
        },
        ...(body ? { body } : {}),
      },
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Task service unavailable' },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  return forward(request, context, 'PATCH');
}

export async function DELETE(request: NextRequest, context: Context) {
  return forward(request, context, 'DELETE');
}
