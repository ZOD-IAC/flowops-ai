import { Workflow, ArrowUpRight, Layers3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      <div className='relative flex min-h-screen flex-col bg-background px-6 py-6 sm:px-12 lg:px-16'>
        <header className='flex items-center justify-between'>
          <Link href='/login' className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
              <Workflow className='size-5' />
            </div>
            <span className='text-xl font-semibold tracking-tight'>
              FlowOps<span className='text-primary'>.</span>
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <main className='flex flex-1 items-center justify-center py-12'>
          <div className='w-full max-w-[400px]'>{children}</div>
        </main>

        <footer className='text-center text-xs text-muted-foreground'>
          © 2026 FlowOps AI. Built for better workflows.
        </footer>
      </div>

      <aside className='relative hidden overflow-hidden bg-[#111827] text-white lg:flex lg:flex-col lg:justify-between'>
        <div
          aria-hidden
          className='pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-indigo-500/20 blur-[110px]'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -bottom-40 -left-32 size-[500px] rounded-full bg-cyan-500/10 blur-[110px]'
        />

        <div className='relative z-10 flex items-center justify-between p-12'>
          <span className='text-sm font-medium tracking-[0.2em] text-white/60'>
            FLOWOPS / WORKSPACE
          </span>
          <ArrowUpRight className='size-5 text-white/50' />
        </div>

        <div className='relative z-10 px-12 xl:px-20'>
          <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-indigo-200'>
            <span className='size-2 rounded-full bg-emerald-400' />
            Your workspace, organized
          </div>

          <h2 className='max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl'>
            Less chaos.
            <br />
            <span className='text-indigo-300'>More momentum.</span>
          </h2>

          <p className='mt-6 max-w-md text-base leading-7 text-slate-400'>
            Bring your projects, teams, and tasks together in one thoughtfully
            designed workspace.
          </p>

          <div className='mt-12 grid max-w-md gap-4'>
            <div className='flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5'>
              <Layers3 className='size-6 text-indigo-300' />
              <div>
                <p className='text-sm font-medium'>Everything connected</p>
                <p className='mt-1 text-xs text-slate-400'>
                  Teams, projects, and tasks in one place.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5'>
              <ShieldCheck className='size-6 text-cyan-300' />
              <div>
                <p className='text-sm font-medium'>Built for teams</p>
                <p className='mt-1 text-xs text-slate-400'>
                  Organized workspaces with role-based access.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='relative z-10 p-12 text-xs text-slate-500'>
          MAKE WORK FLOW BETTER.
        </div>
      </aside>
    </div>
  );
}
