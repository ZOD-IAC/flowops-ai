'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TaskFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateFilter('search', search);
        }}
        className='flex gap-2'
      >
        <Input
          placeholder='Search tasks...'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className='w-56'
        />

        <Button type='submit' variant='outline'>
          Search
        </Button>
      </form>

      <select
        aria-label='Filter by status'
        value={searchParams.get('status') ?? ''}
        onChange={(event) => updateFilter('status', event.target.value)}
        className='rounded-md border bg-background px-3 py-2 text-sm'
      >
        <option value=''>All statuses</option>
        <option value='TODO'>To Do</option>
        <option value='IN_PROGRESS'>In Progress</option>
        <option value='DONE'>Done</option>
      </select>

      <select
        aria-label='Filter by priority'
        value={searchParams.get('priority') ?? ''}
        onChange={(event) => updateFilter('priority', event.target.value)}
        className='rounded-md border bg-background px-3 py-2 text-sm'
      >
        <option value=''>All priorities</option>
        <option value='1'>Low</option>
        <option value='2'>Medium</option>
        <option value='3'>High</option>
      </select>

      <select
        aria-label='Sort tasks'
        value={searchParams.get('ordering') ?? '-created_at'}
        onChange={(event) => updateFilter('ordering', event.target.value)}
        className='rounded-md border bg-background px-3 py-2 text-sm'
      >
        <option value='-created_at'>Newest first</option>
        <option value='created_at'>Oldest first</option>
        <option value='due_date'>Due date</option>
        <option value='-priority'>Highest priority</option>
      </select>
    </div>
  );
}
