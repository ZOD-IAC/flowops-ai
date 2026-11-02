import { Suspense } from 'react';
import { AuthenticatedDashboard } from '@/components/auth/authenticated-dashboard';

function DashboardLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='space-y-3 text-center'>
        <div className='mx-auto size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary' />
        <p className='text-sm text-muted-foreground'>
          Loading your workspace...
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
