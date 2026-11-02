import { NextResponse } from 'next/server';
import { djangoFetch } from '@/lib/api/server';

export async function GET() {
  try {
    const response = await djangoFetch('/api/auth/me/');

    return NextResponse.json({
      frontend: 'running',
      backend: 'reachable',
      backendStatus: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        frontend: 'running',
        backend: 'unreachable',
      },
      { status: 503 },
    );
  }
}
