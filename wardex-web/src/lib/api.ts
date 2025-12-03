import { get } from "svelte/store";
import { browser } from "$app/environment";
import { auth } from "$lib/stores/auth";
import { goto } from "$app/navigation";

const API_BASE = "https://wardex-vm.switzerlandnorth.cloudapp.azure.com:3443";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token } = get(auth);

  const hasBody = options.body !== undefined && options.body !== null;

  const headers: HeadersInit = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && browser) {
    auth.logout();
    if (typeof window !== "undefined") goto("/auth");
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if ((body as any).message) msg = (body as any).message;
    } catch { }
    throw new Error(msg);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
