'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, LogOut, LoaderCircle } from 'lucide-react';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

export function UserMenu() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError('');

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      router.replace('/login');
      router.refresh();
    } catch {
      setError('Unable to sign out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      user.username
    : 'Account';

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                disabled={loading || loggingOut}
                tooltip='Account'
              />
            }
          >
            <Avatar className='size-8 rounded-lg'>
              <AvatarFallback className='rounded-lg bg-primary/10 text-xs font-semibold text-primary'>
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>
                {loading ? 'Loading...' : displayName}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {user?.email || user?.username || 'Workspace account'}
              </span>
            </div>

            <ChevronsUpDown className='ml-auto size-4' />
          </DropdownMenuTrigger>

          <DropdownMenuContent side='top' align='start' className='w-56'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My account</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={loggingOut}
                onClick={() => void handleLogout()}
              >
                {loggingOut ? (
                  <LoaderCircle className='size-4 animate-spin' />
                ) : (
                  <LogOut className='size-4' />
                )}
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {error && (
          <p role='alert' className='px-2 pt-2 text-xs text-destructive'>
            {error}
          </p>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
