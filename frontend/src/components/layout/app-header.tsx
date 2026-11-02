'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  const pathname = usePathname();

  const title = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';

  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6'>
      <div className='flex items-center gap-3'>
        <SidebarTrigger />

        <Separator orientation='vertical' className='h-5' />

        <span className='text-sm font-medium capitalize'>
          {title.replaceAll('-', ' ')}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <ThemeToggle />

        <Button variant='ghost' size='icon' aria-label='Notifications' disabled>
          <Bell className='size-4' />
        </Button>
      </div>
    </header>
  );
}
