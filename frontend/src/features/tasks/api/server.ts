import { getAccessToken } from '@/lib/auth/session';
import { Task, TaskListResponse } from '../types';
import { djangoFetch } from '@/lib/api/server';

export type TaskFilters = {
  page?: number;
  search?: string;
  status?: string;
  priority?: string;
  ordering?: string;
};

export async function getTasks(
  organizationId: string,
  projectId: string,
  filters: TaskFilters = {},
): Promise<TaskListResponse> {
  const access = await getAccessToken();

  if (!access) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();

  if (filters.page) params.set('page', String(filters.page));
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.ordering) params.set('ordering', filters.ordering);

  const response = await djangoFetch(
    `/api/organizations/${organizationId}/projects/${projectId}/tasks/?${params}`,
    {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load tasks (${response.status})`);
  }

  const data: TaskListResponse | Task[] = await response.json();

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return data;
}
