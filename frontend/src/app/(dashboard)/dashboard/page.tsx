import { ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-3'>
          <Badge variant='secondary'>Your workspace</Badge>

          <div>
            <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
              Workspace overview
            </h1>

            <p className='mt-2 text-sm text-muted-foreground'>
              Your projects, tasks, and workflows in one place.
            </p>
          </div>
        </div>

        <Button disabled>
          New project
          <ArrowUpRight className='ml-2 size-4' />
        </Button>
      </div>

      <div className='rounded-2xl border bg-card p-8 md:p-12'>
        <div className='max-w-md space-y-3'>
          <div className='flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <ArrowUpRight className='size-6' />
          </div>

          <h2 className='text-xl font-semibold tracking-tight'>
            Your workspace is taking shape.
          </h2>

          <p className='text-sm leading-relaxed text-muted-foreground'>
            The application shell is ready. Next, we&apos;ll connect your
            organizations and projects to the Django backend.
          </p>
        </div>
      </div>
    </div>
  );
}
