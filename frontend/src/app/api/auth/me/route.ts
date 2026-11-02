import { NextResponse } from 'next/server';

import { djangoFetch } from '@/lib/api/server';
import { getAccessToken } from '@/lib/auth/session';

export async function GET() {
  const access = await getAccessToken();

  if (!access) {
    return NextResponse.json({ detail: 'Not Authenticated ' }, { status: 401 });
  }

  try {
    const response = await djangoFetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (response.status === 401) {
      return NextResponse.json(
        { detail: 'Access token expired or invalid' },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: 'Unable to retrieve user' },
        { status: 502 },
      );
    }

    // const user = response.json();

    // return NextResponse.json(user, {
    //   headers: {
    //     'Cache-Control': 'no-store',
    //   },
    // });

    const rawResponse = await response.text();

    return new Response(rawResponse, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Backend unavailable' },
      { status: 503 },
    );
  }
}
