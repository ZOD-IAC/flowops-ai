'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  ArrowLeft,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Project } from '../types';

type Props = {
  organizationId: string;
  project: Project;
};

function getErrorMessage(status: number): string {
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 404) return 'Project not found or access denied.';
  return 'Something went wrong. Please try again.';
}

export function ProjectDetails({ organizationId, project }: Props) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');

  const endpoint = `/api/organizations/${organizationId}/projects/${project.id}`;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || !name.trim()) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.name?.[0] ||
            data?.description?.[0] ||
            data?.detail ||
            getErrorMessage(response.status),
        );
      }

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;

    const confirmed = window.confirm(
      `Permanently delete "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let detail = getErrorMessage(response.status);

        try {
          const data = await response.json();
          detail = data?.detail || detail;
        } catch {
          // Keep the status-based error.
        }

        throw new Error(detail);
      }

      router.replace(`/organizations/${organizationId}/projects`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete project.',
      );
      setDeleting(false);
    }
  }

  function cancelEditing() {
    setName(project.name);
    setDescription(project.description ?? '');
    setError('');
    setEditing(false);
  }

  return (
    <div className='mx-auto w-full max-w-5xl space-y-8'>
      <Link
        href={`/organizations/${organizationId}/projects`}
        className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='size-4' />
        Back to projects
      </Link>

      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-4'>
          <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <FolderKanban className='size-7' />
          </div>

          <div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Project
            </p>

            <h1 className='text-3xl font-semibold tracking-tight'>
              {project.name}
            </h1>
          </div>
        </div>

        {!editing && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setName(project.name);
                setDescription(project.description ?? '');
                setEditing(true);
              }}
            >
              <Pencil className='size-4' />
              Edit
            </Button>

            <Button
              variant='destructive'
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? (
                <LoaderCircle className='size-4 animate-spin' />
              ) : (
                <Trash2 className='size-4' />
              )}
              Delete
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit project' : 'Project overview'}</CardTitle>
        </CardHeader>

        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='edit-project-name'>Project name</Label>

                <Input
                  id='edit-project-name'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-project-description'>Description</Label>

                <textarea
                  id='edit-project-description'
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className='w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                />
              </div>

              <div className='flex justify-end gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={saving}
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>

                <Button type='submit' disabled={saving || !name.trim()}>
                  {saving && <LoaderCircle className='size-4 animate-spin' />}
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className='space-y-6'>
              <div>
                <p className='mb-2 text-sm font-medium'>Description</p>

                <p className='whitespace-pre-wrap text-sm leading-7 text-muted-foreground'>
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className='grid gap-5 border-t pt-5 sm:grid-cols-2'>
                <div>
                  <p className='text-xs text-muted-foreground'>Created</p>

                  <p className='mt-1 text-sm'>
                    {new Date(project.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div>
                  <p className='text-xs text-muted-foreground'>Last updated</p>

                  <p className='mt-1 text-sm'>
                    {new Date(project.updated_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
