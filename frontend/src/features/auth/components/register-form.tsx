'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must contain at least 3 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function getErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Registration failed. Please try again.';
  }

  const errors = data as Record<string, unknown>;

  for (const value of Object.values(errors)) {
    if (typeof value === 'string') return value;

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }

  return 'Registration failed. Please check your details.';
}

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterValues>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: keyof RegisterValues, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const parsed = registerSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid details');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(getErrorMessage(result));
        return;
      }

      router.replace('/login?registered=1');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      autoComplete: 'username',
      placeholder: 'Choose a username',
    },
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      autoComplete: 'email',
      placeholder: 'you@example.com',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: 'Create a strong password',
    },
    {
      name: 'password_confirm',
      label: 'Confirm password',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: 'Repeat your password',
    },
  ] as const;

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          Create your account<span className='text-primary'>.</span>
        </h1>

        <p className='mt-3 text-sm text-muted-foreground'>
          Start organizing your projects and workflows.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {fields.map((field) => (
          <div key={field.name} className='space-y-2'>
            <Label htmlFor={field.name}>{field.label}</Label>

            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(event) => updateField(field.name, event.target.value)}
              disabled={loading}
              className='h-11'
              required
            />
          </div>
        ))}

        {error && (
          <div
            role='alert'
            className='rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive'
          >
            {error}
          </div>
        )}

        <Button
          type='submit'
          disabled={loading}
          className='mt-2 h-11 w-full gap-2'
        >
          {loading ? (
            <>
              <LoaderCircle className='size-4 animate-spin' />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className='size-4' />
            </>
          )}
        </Button>
      </form>

      <p className='mt-8 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium text-primary hover:underline'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
