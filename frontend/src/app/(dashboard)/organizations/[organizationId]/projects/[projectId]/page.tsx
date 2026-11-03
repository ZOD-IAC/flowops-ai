import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';

import { getProject, ApiError } from '@/features/projects/api/server';
import { ProjectDetails } from '@/features/projects/components/project-details';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
};

async function ProjectContent({ params }: Props) {
  const { organizationId, projectId } = await params;

  let project;

  try {
    project = await getProject(organizationId, projectId);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect('/login');
      if (error.status === 404) notFound();
    }

    throw error;
  }

  return (
    <ProjectDetails
      key={`${organizationId}-${projectId}`}
      organizationId={organizationId}
      project={project}
    />
  );
}

export default function ProjectDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className='mx-auto w-full max-w-5xl space-y-6'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-12 w-72' />
          <Skeleton className='h-64 w-full rounded-xl' />
        </div>
      }
    >
      <ProjectContent params={params} />
    </Suspense>
  );
}
