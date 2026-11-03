import { Suspense } from 'react';
import { ProjectList } from '@/features/projects/components/project-list';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: Promise<{
    organizationId: string;
  }>;
};

async function ProjectsContent({ params }: Props) {
  const { organizationId } = await params;

  return (
    <div className='mx-auto w-full max-w-7xl'>
      <ProjectList organizationId={organizationId} />
    </div>
  );
}

function ProjectsFallback() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <Skeleton className='h-9 w-48' />
      <Skeleton className='h-5 w-72' />

      <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className='h-52 rounded-xl' />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage({ params }: Props) {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <ProjectsContent params={params} />
    </Suspense>
  );
}
