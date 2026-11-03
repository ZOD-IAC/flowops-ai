import Link from 'next/link';
import { ArrowUpRight, FolderKanban } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Project } from '../types';

type Props = {
  project: Project;
  organizationId: string;
};

export function ProjectCard({ project, organizationId }: Props) {
  return (
    <Link
      href={`/organizations/${organizationId}/projects/${project.id}`}
      className='block h-full'
    >
      <Card className='group h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <FolderKanban className='size-5' />
          </div>

          <ArrowUpRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
        </CardHeader>

        <CardContent className='space-y-3'>
          <CardTitle className='text-lg'>{project.name}</CardTitle>

          <p className='line-clamp-2 min-h-10 text-sm text-muted-foreground'>
            {project.description || 'No description provided.'}
          </p>

          <p className='border-t pt-3 text-xs text-muted-foreground'>
            Created{' '}
            {new Date(project.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
