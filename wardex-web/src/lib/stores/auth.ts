import { writable } from 'svelte/store';

export type JwtUser = {
  userId: string;
  email: string;
};

export type AuthState = {
  token: string | null;
  user: JwtUser | null;
};

function decodeJwt(token: string): JwtUser | null {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(json);
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

export const STORAGE_KEY = 'wardex-auth';

function loadInitial(): AuthState {
  if (typeof localStorage === 'undefined') return { token: null, user: null };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.token) return { token: null, user: null };
    const user = decodeJwt(parsed.token);
    if (!user) return { token: null, user: null };
    return { token: parsed.token, user };
  } catch {
    return { token: null, user: null };
  }
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(loadInitial());

  return {
    subscribe,
    login(token: string) {
      const user = decodeJwt(token);
      const state: AuthState = { token, user };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
      set(state);
    },
    logout() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ token: null, user: null });
    }
  };
}

export const auth = createAuthStore();
