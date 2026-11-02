import Link from 'next/link';
import { ArrowUpRight, Building2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Organization } from '../types';

type Props = {
  organization: Organization;
};

export function OrganizationCard({ organization }: Props) {
  return (
    <Link href={`/organizations/${organization.id}`}>
      <Card className='group h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg'>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Building2 className='size-5' />
          </div>

          <ArrowUpRight className='size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
        </CardHeader>

        <CardContent className='space-y-2'>
          <CardTitle className='text-lg'>{organization.name}</CardTitle>

          <p className='text-sm text-muted-foreground'>{organization.slug}</p>

          <p className='pt-2 text-xs text-muted-foreground'>
            Created{' '}
            {new Date(organization.created_at).toLocaleDateString('en-IN', {
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
