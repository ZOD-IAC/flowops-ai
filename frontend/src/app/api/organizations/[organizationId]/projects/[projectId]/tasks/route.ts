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

const taskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().default(''),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    assignee: z.number().int().positive().nullable().optional(),
    due_date: z.iso.date().nullable().optional(),
  })
  .strict();

export async function POST(request: NextRequest, context: Context) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ detail: 'Invalid origin' }, { status: 403 });
  }

  const { organizationId, projectId } = await context.params;

  if (!/^[1-9]\d*$/.test(organizationId) || !/^[1-9]\d*$/.test(projectId)) {
    return NextResponse.json({ detail: 'Invalid ID' }, { status: 400 });
  }

  const access = await getAccessToken();

  if (!access) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = taskSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { detail: 'Invalid task data', errors: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const response = await djangoFetch(
      `/api/organizations/${organizationId}/projects/${projectId}/tasks/`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify(parsed.data),
      },
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: 'Task service unavailable' },
      { status: 502 },
    );
  }
}
