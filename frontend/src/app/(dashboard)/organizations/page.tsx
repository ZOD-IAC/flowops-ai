import { redirect } from 'next/navigation';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';

import type { OrganizationListResponse } from '@/features/organizations/types';

import { OrganizationList } from '@/features/organizations/components/organization-list';
import { CreateOrganizationDialog } from '@/features/organizations/components/create-organization-dialog';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function OrganizationsContent() {
  // Move your existing page's data fetching and JSX here.
  const access = await getAccessToken();

  if (!access) {
    redirect('/login');
  }

  const response = await djangoFetch('/api/organization/', {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    throw new Error('Failed to load organizations');
  }

  const data: OrganizationListResponse = await response.json();

  const organizations = Array.isArray(data) ? data : data.results;

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <p className='mb-2 text-sm font-medium text-primary'>WORKSPACES</p>

          <h1 className='text-3xl font-semibold tracking-tight'>
            Organizations
          </h1>

          <p className='mt-2 text-sm text-muted-foreground'>
            Manage your workspaces and collaborate with your team.
          </p>
        </div>

        {organizations.length > 0 && <CreateOrganizationDialog />}
      </div>

      <OrganizationList organizations={organizations} />
    </div>
  );
}

function OrganizationsSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-10 w-64' />

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className='h-44 rounded-xl' />
        ))}
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<OrganizationsSkeleton />}>
      <OrganizationsContent />
    </Suspense>
  );
}
