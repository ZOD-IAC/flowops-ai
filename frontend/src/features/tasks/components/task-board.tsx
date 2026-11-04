'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskActions } from './task-actions';

type Props = {
  organizationId: string;
  projectId: string;
  tasks: Task[];
};

const statusLabels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const priorityLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

export function TaskBoard({ organizationId, projectId, tasks }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || creating) return;

    setCreating(true);
    setError('');

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/projects/${projectId}/tasks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            status: 'TODO',
            priority: 2,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Unable to create task');
      }

      setTitle('');
      setDescription('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-semibold tracking-tight'>Tasks</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          Manage work within this project.
        </p>
      </div>

      <form onSubmit={createTask} className='space-y-3 rounded-xl border p-5'>
        <h2 className='font-semibold'>Create task</h2>

        <Input
          placeholder='Task title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
        />

        <Input
          placeholder='Description (optional)'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}

        <Button type='submit' disabled={creating || !title.trim()}>
          {creating ? 'Creating...' : 'Create task'}
        </Button>
      </form>

      <div className='space-y-3'>
        {tasks.length === 0 ? (
          <div className='rounded-xl border border-dashed p-10 text-center text-muted-foreground'>
            No tasks yet. Create the first one.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className='flex flex-col justify-between gap-3 rounded-xl border p-5 sm:flex-row sm:items-center'
            >
              <div className='space-y-1'>
                <h3 className='font-medium'>{task.title}</h3>

                {task.description && (
                  <p className='text-sm text-muted-foreground'>
                    {task.description}
                  </p>
                )}

                <p className='text-xs text-muted-foreground'>
                  Priority: {priorityLabels[task.priority]}
                  {task.due_date && ` · Due: ${task.due_date}`}
                </p>
              </div>

              <span className='w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium'>
                {statusLabels[task.status]}
              </span>

              <TaskActions
                // key={`${task.id}-${task.updated_at}`}
                task={task}
                organizationId={organizationId}
                projectId={projectId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
