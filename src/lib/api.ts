import { API_BASE_URL } from './config';

export async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, { ...options, headers });

  // Some endpoints might return empty body
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error((data as any).error || 'Request failed');
  return data;
}
