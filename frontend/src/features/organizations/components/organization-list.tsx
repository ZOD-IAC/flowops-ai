import { Building2 } from 'lucide-react';

import type { Organization } from '../types';
import { OrganizationCard } from './organization-card';
import { CreateOrganizationDialog } from './create-organization-dialog';

type Props = {
  organizations: Organization[];
};

export function OrganizationList({ organizations }: Props) {
  if (organizations.length === 0) {
    return (
      <div className='flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 text-center'>
        <div className='mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <Building2 className='size-6' />
        </div>

        <h2 className='text-xl font-semibold'>
          Your first workspace starts here
        </h2>

        <p className='mb-6 mt-2 max-w-sm text-sm text-muted-foreground'>
          Create an organization to bring your projects, tasks, and team
          together.
        </p>

        <CreateOrganizationDialog />
      </div>
    );
  }

  return (
    <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
      {organizations.map((organization) => (
        <OrganizationCard key={organization.id} organization={organization} />
      ))}
    </div>
  );
}
