'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Task, TaskStatus, TaskPriority } from '../types';

type Props = {
  task: Task;
  organizationId: string;
  projectId: string;
};

const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function TaskActions({ task, organizationId, projectId }: Props) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? '');

  const endpoint = `/api/organizations/${organizationId}/projects/${projectId}/tasks/${task.id}`;

  async function updateTask(payload: Record<string, unknown>) {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        const message =
          data.detail ||
          Object.values(data)
            .flat()
            .find((v) => typeof v === 'string') ||
          'Unable to update task';

        throw new Error(String(message));
      }

      setEditing(false);
      router.refresh();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(value: TaskStatus) {
    const previous = status;
    setStatus(value);

    // Only status is sent, supporting the assigned-member permission rule.
    const success = await updateTask({ status: value });

    if (!success) {
      setStatus(previous);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateTask({
      title,
      description,
      status,
      priority,
      due_date: dueDate || null,
    });
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}" permanently?`)) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Unable to delete task');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='space-y-3'>
      {!editing ? (
        <div className='flex flex-wrap items-center gap-2'>
          <select
            aria-label={`Status for ${task.title}`}
            value={status}
            disabled={saving}
            onChange={(event) =>
              void updateStatus(event.target.value as TaskStatus)
            }
            className='rounded-md border bg-background px-3 py-2 text-sm'
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <Button
            variant='outline'
            size='sm'
            disabled={saving}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>

          <Button
            variant='destructive'
            size='sm'
            disabled={saving}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSave} className='space-y-3'>
          <Input
            aria-label='Task title'
            value={title}
            maxLength={200}
            required
            onChange={(event) => setTitle(event.target.value)}
          />

          <textarea
            aria-label='Task description'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className='w-full rounded-md border bg-background p-3 text-sm'
            rows={3}
          />

          <select
            aria-label='Task status'
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className='w-full rounded-md border bg-background p-2 text-sm'
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <select
            aria-label='Task priority'
            value={priority}
            onChange={(event) =>
              setPriority(Number(event.target.value) as TaskPriority)
            }
            className='w-full rounded-md border bg-background p-2 text-sm'
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>

          <Input
            type='date'
            aria-label='Due date'
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />

          <div className='flex gap-2'>
            <Button type='submit' disabled={saving || !title.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>

            <Button
              type='button'
              variant='outline'
              disabled={saving}
              onClick={() => {
                setTitle(task.title);
                setDescription(task.description);
                setStatus(task.status);
                setPriority(task.priority);
                setDueDate(task.due_date ?? '');
                setError('');
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}
    </div>
  );
}
