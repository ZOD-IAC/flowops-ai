'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LoaderCircle, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const parsed = loginSchema.safeParse({ username, password });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        setError(
          response.status === 401
            ? 'Incorrect username or password.'
            : 'Unable to sign in. Please try again.',
        );
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to connect. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className='mb-9'>
        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          Welcome back
          <span className='text-primary'>.</span>
        </h1>
        <p className='mt-3 text-sm text-muted-foreground'>
          Enter your credentials to access your workspace.
        </p>
      </div>

      {registered && (
        <div
          role='status'
          className='mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400'
        >
          Account created successfully. You can now sign in.
        </div>
      )}
      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            name='username'
            autoComplete='username'
            placeholder='Enter your username'
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            className='h-11'
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='Enter your password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className='h-11 pr-12'
              required
            />

            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
            >
              {showPassword ? (
                <EyeOff className='size-4' />
              ) : (
                <Eye className='size-4' />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role='alert'
            className='rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive'
          >
            {error}
          </div>
        )}

        <Button type='submit' disabled={loading} className='h-11 w-full gap-2'>
          {loading ? (
            <>
              <LoaderCircle className='size-4 animate-spin' />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className='size-4' />
            </>
          )}
        </Button>
      </form>

      <p className='mt-8 text-center text-sm text-muted-foreground'>
        New to FlowOps?{' '}
        <Link
          href='/register'
          className='font-medium text-primary hover:underline'
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
