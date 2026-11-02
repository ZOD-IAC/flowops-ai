import { redirect } from 'next/navigation';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAccessToken();

  if (!access) {
    redirect('/login');
  }

  let response: Response;

  try {
    response = await djangoFetch('/api/auth/me/', {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
  } catch {
    throw new Error('Unable to connect to authentication service');
  }

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    throw new Error('Unable to verify authentication');
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className='min-w-0'>
        <AppHeader />

        <main className='flex-1 p-4 md:p-6 lg:p-8'>
          <div className='mx-auto w-full max-w-7xl'>{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
