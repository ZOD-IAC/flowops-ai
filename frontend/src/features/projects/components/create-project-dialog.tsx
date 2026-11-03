'use client';

import { useState } from 'react';
import { LoaderCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
  organizationId: string;
  onCreated: () => void;
};

export function CreateProjectDialog({ organizationId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/projects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.name?.[0] || 'Unable to create project',
        );
      }

      setName('');
      setDescription('');
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className='size-4' />
        New project
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Add a project to your current workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='project-name'>Project name</Label>

            <Input
              id='project-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Website redesign'
              maxLength={200}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project-description'>Description</Label>

            <textarea
              id='project-description'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder='What is this project about?'
              rows={4}
              className='w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
            />
          </div>

          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}

          <Button
            type='submit'
            className='w-full'
            disabled={submitting || !name.trim()}
          >
            {submitting && <LoaderCircle className='size-4 animate-spin' />}
            {submitting ? 'Creating...' : 'Create project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
