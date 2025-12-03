import { get } from "svelte/store";
import { browser } from "$app/environment";
import { auth } from "$lib/stores/auth";

const API_BASE = "https://wardex-vm.switzerlandnorth.cloudapp.azure.com:3443";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token } = get(auth);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && browser) {
    auth.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if ((body as any).message) msg = (body as any).message;
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
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
