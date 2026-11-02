import 'server-only';

const API_URl = process.env.DJANGO_API_URL;

export async function djangoFetch(path: string, options: RequestInit = {}) {
  if (!API_URl) {
    throw new Error('DJANGO_API_URL is not configured');
  }

  const response = await fetch(`${API_URl}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}
