'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/features/auth/types';
import { apiFetch } from '@/lib/api/client';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await apiFetch('/api/auth/me', {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data: User = await response.json();

        if (!controller.signal.aborted) {
          setUser(data);
        }
      } catch {
        // A failed request should not crash the navigation.
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  return { user, loading };
}
