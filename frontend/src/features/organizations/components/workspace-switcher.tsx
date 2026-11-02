'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Building2, ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { Organization, OrganizationListResponse } from '../types';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const currentId = Number(params.organizationId);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const response = await fetch('/api/organizations', {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const data: OrganizationListResponse = await response.json();

        setOrganizations(Array.isArray(data) ? data : data.results);
      } catch {
        // The switcher remains usable through the organizations page.
      } finally {
        setLoading(false);
      }
    }

    loadOrganizations();
  }, []);

  const activeOrganization = organizations.find(
    (organization) => organization.id === currentId,
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                disabled={loading}
                tooltip='Switch workspace'
              />
            }
          >
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Building2 className='size-4' />
            </div>

            <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {activeOrganization?.name || 'FlowOps AI'}
              </span>

              <span className='truncate text-xs text-muted-foreground'>
                {activeOrganization ? 'Workspace' : 'Select workspace'}
              </span>
            </div>

            <ChevronsUpDown className='ml-auto size-4' />
          </DropdownMenuTrigger>

          <DropdownMenuContent side='bottom' align='start' className='w-64'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>

              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() =>
                    router.push(`/organizations/${organization.id}`)
                  }
                >
                  <Building2 className='size-4' />
                  <span className='truncate'>{organization.name}</span>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push('/organizations')}>
                <Plus className='size-4' />
                Manage organizations
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
