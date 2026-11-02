'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export function CreateOrganizationDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(value: string) {
    setName(value);

    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.slug?.[0] ||
            data?.name?.[0] ||
            data?.detail ||
            'Unable to create organization',
        );
      }

      setOpen(false);
      setName('');
      setSlug('');

      router.refresh();
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
        New organization
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Create a workspace to manage projects, tasks, and your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='organization-name'>Organization name</Label>

            <Input
              id='organization-name'
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder='Acme Studio'
              required
              maxLength={100}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='organization-slug'>Workspace URL identifier</Label>

            <Input
              id='organization-slug'
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder='acme-studio'
              required
              pattern='[a-z0-9]+(-[a-z0-9]+)*'
            />

            <p className='text-xs text-muted-foreground'>
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}

          <Button
            type='submit'
            disabled={submitting || !name.trim() || !slug.trim()}
            className='w-full'
          >
            {submitting && <LoaderCircle className='size-4 animate-spin' />}

            {submitting ? 'Creating...' : 'Create organization'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
