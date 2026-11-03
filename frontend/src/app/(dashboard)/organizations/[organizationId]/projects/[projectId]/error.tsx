'use client';

import { Button } from '@/components/ui/button';

export default function ProjectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-64 flex-col items-center justify-center gap-4'>
      <h2 className='text-xl font-semibold'>Unable to load project</h2>

      <p className='text-sm text-muted-foreground'>
        Something went wrong while loading this project.
      </p>

      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
