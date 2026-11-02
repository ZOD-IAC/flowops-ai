import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import {
  ArrowRight,
  FolderKanban,
  ListTodo,
  Users,
  Building2,
} from 'lucide-react';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';

import type {
  Organization,
  OrganizationListResponse,
} from '@/features/organizations/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDashboard({ params }: Props) {
  const { organizationId } = await params;

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
    throw new Error('Unable to load organization');
  }

  const data: OrganizationListResponse = await response.json();

  const organizations: Organization[] = Array.isArray(data)
    ? data
    : data.results;

  const organization = organizations.find(
    (item) => item.id === Number(organizationId),
  );

  if (!organization) {
    notFound();
  }

  const sections = [
    {
      title: 'Projects',
      description: 'Organize initiatives and track delivery.',
      icon: FolderKanban,
      href: `/organizations/${organization.id}/projects`,
    },
    {
      title: 'Tasks',
      description: 'Manage assignments and monitor progress.',
      icon: ListTodo,
      href: `/organizations/${organization.id}/tasks`,
    },
    {
      title: 'Team',
      description: 'View members and manage collaboration.',
      icon: Users,
      href: `/organizations/${organization.id}/members`,
    },
  ];

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8'>
      <div>
        <Link
          href='/organizations'
          className='text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          Organizations
        </Link>

        <div className='mt-4 flex items-center gap-4'>
          <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Building2 className='size-7' />
          </div>

          <div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Workspace
            </p>

            <h1 className='text-3xl font-semibold tracking-tight'>
              {organization.name}
            </h1>

            <p className='mt-1 text-sm text-muted-foreground'>
              {organization.slug}
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-3'>
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.title} href={section.href}>
              <Card className='group h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Icon className='size-5' />
                  </div>

                  <ArrowRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-1' />
                </CardHeader>

                <CardContent>
                  <CardTitle className='text-lg'>{section.title}</CardTitle>

                  <p className='mt-2 text-sm text-muted-foreground'>
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
