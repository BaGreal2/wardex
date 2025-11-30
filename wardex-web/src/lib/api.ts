import { get } from 'svelte/store';
import { auth } from './stores/auth';

const API_BASE = 'https://wardex-vm.switzerlandnorth.cloudapp.azure.com:3443';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token } = get(auth);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.message) msg = body.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) })
};
