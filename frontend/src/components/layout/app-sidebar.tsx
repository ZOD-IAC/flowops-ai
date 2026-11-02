'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/layout/user-menu';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Settings2,
  Workflow,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const navigation = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
  { title: 'My Tasks', href: '/tasks', icon: ListTodo },
  { title: 'Settings', href: '/settings', icon: Settings2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader className='p-3'>
        <div className='flex items-center gap-3 px-2 py-2'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            <Workflow className='size-5' />
          </div>

          <div className='min-w-0 group-data-[collapsible=icon]:hidden'>
            <p className='truncate text-sm font-semibold tracking-tight'>
              FlowOps
            </p>
            <p className='text-xs text-muted-foreground'>Workspace</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.title}
                    >
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* 
      <SidebarFooter className='p-3'>
        <div className='px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden'>
          FlowOps AI · Development
        </div>
      </SidebarFooter> */}

      <SidebarFooter className='p-3'>
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
