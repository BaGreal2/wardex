import { writable } from "svelte/store";
import { browser } from "$app/environment";

export const STORAGE_KEY = "wardex-auth";

export type AuthUser = {
  email: string;
  userId: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const createAuthStore = () => {
  const initial: AuthState = {
    token: null,
    user: null
  };

  const loadInitial = (): AuthState => {
    if (!browser) return initial;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;

    try {
      const parsed = JSON.parse(raw);
      return {
        token: parsed.token ?? null,
        user: parsed.user ?? null
      };
    } catch {
      return initial;
    }
  };

  const { subscribe, set, update } = writable<AuthState>(loadInitial());

  const persist = (state: AuthState) => {
    if (!browser) return;

    if (!state.token) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  return {
    subscribe,
    set,
    update,
    login(token: string, user: AuthUser) {
      const state: AuthState = { token, user };
      set(state);
      persist(state);
    },
    logout() {
      const state: AuthState = { token: null, user: null };
      set(state);
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };
};

export const auth = createAuthStore();
