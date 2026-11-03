import 'server-only';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';

import type { Project } from '../types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getProject(
  organizationId: string,
  projectId: string,
): Promise<Project> {
  const access = await getAccessToken();

  if (!access) {
    throw new ApiError(401, 'Authentication required');
  }

  const response = await djangoFetch(
    `/api/organizations/${organizationId}/projects/${projectId}/`,
    {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 404 ? 'Project not found' : 'Unable to load project',
    );
  }

  return response.json() as Promise<Project>;
}
