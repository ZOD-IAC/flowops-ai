'use client';

import { useCallback, useEffect, useState } from 'react';
import { FolderKanban, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/client';

import type { Project, ProjectListResponse } from '../types';

import { ProjectCard } from './project-card';
import { CreateProjectDialog } from './create-project-dialog';

type Props = {
  organizationId: string;
};

export function ProjectList({ organizationId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setPage(1);
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError('');

      try {
        const response = await apiFetch(
          `/api/organizations/${organizationId}/projects?page=${page}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? 'You do not have permission to view these projects.'
              : response.status === 404
                ? 'Organization not found or access denied.'
                : 'Unable to load projects.',
          );
        }

        const data: ProjectListResponse = await response.json();

        if (controller.signal.aborted) return;

        setProjects(Array.isArray(data) ? data : data.results);
        setHasNext(!Array.isArray(data) && Boolean(data.next));
        setHasPrevious(!Array.isArray(data) && Boolean(data.previous));
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Unable to load projects.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => controller.abort();
  }, [organizationId, page, reloadKey]);

  return (
    <div className='space-y-7'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wider text-primary'>
            Workspace
          </p>

          <h1 className='mt-2 text-3xl font-semibold tracking-tight'>
            Projects
          </h1>

          <p className='mt-2 text-sm text-muted-foreground'>
            Organize and manage work across your team.
          </p>
        </div>

        <CreateProjectDialog
          organizationId={organizationId}
          onCreated={reload}
        />
      </div>

      {loading ? (
        <div className='flex min-h-64 items-center justify-center'>
          <LoaderCircle className='size-6 animate-spin text-muted-foreground' />
        </div>
      ) : error ? (
        <div className='rounded-xl border p-8 text-center'>
          <p role='alert' className='mb-4 text-sm text-destructive'>
            {error}
          </p>

          <Button variant='outline' onClick={reload}>
            Try again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className='flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center'>
          <FolderKanban className='mb-4 size-9 text-muted-foreground' />

          <h2 className='text-lg font-semibold'>No projects yet</h2>

          <p className='mt-2 text-sm text-muted-foreground'>
            Create your first project to start organizing work.
          </p>
        </div>
      ) : (
        <>
          <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                organizationId={organizationId}
              />
            ))}
          </div>

          {(hasPrevious || hasNext) && (
            <div className='flex items-center justify-end gap-3'>
              <Button
                variant='outline'
                disabled={!hasPrevious}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>

              <span className='text-sm text-muted-foreground'>Page {page}</span>

              <Button
                variant='outline'
                disabled={!hasNext}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
