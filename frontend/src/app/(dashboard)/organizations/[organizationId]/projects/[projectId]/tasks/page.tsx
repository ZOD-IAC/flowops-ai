import { Suspense } from 'react';

import { getTasks, type TaskFilters } from '@/features/tasks/api/server';

import { TaskBoard } from '@/features/tasks/components/task-board';
import { TaskFiltersBar } from '@/features/tasks/components/task-filters-bar';

type Props = {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    priority?: string;
    ordering?: string;
  }>;
};

async function TasksContent({ params, searchParams }: Props) {
  const { organizationId, projectId } = await params;
  const query = await searchParams;

  const parsedPage = Number(query.page ?? '1');
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const filters: TaskFilters = {
    page,
    search: query.search,
    status: query.status,
    priority: query.priority,
    ordering: query.ordering,
  };

  const data = await getTasks(organizationId, projectId, filters);

  return (
    <div className='space-y-6'>
      <TaskFiltersBar />

      <TaskBoard
        organizationId={organizationId}
        projectId={projectId}
        tasks={data.results}
      />

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>{data.count} tasks</p>

        <div className='flex gap-3'>
          {data.previous && (
            <a
              href={`?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(query).filter(([key]) => key !== 'page'),
                ),
                page: String(page - 1),
              })}`}
              className='rounded-md border px-4 py-2 text-sm'
            >
              Previous
            </a>
          )}

          {data.next && (
            <a
              href={`?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(query).filter(([key]) => key !== 'page'),
                ),
                page: String(page + 1),
              })}`}
              className='rounded-md border px-4 py-2 text-sm'
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage(props: Props) {
  return (
    <Suspense fallback={<p className='p-6'>Loading tasks...</p>}>
      <TasksContent {...props} />
    </Suspense>
  );
}
