<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { auth, STORAGE_KEY, type AuthUser } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let loading = false;
  let error: string | null = null;

  type LoginResponse = {
    token: string;
    user?: {
      id?: string;
      userId?: string;
      email?: string;
    };
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = null;

    try {
      const res = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password
      });

      const user: AuthUser = {
        email,
        userId: ''
      };

      auth.login(res.token, user);
      goto('/');
    } catch (e) {
      error =
        e instanceof Error ? e.message : 'Login failed. Check credentials.';
    } finally {
      loading = false;
    }
  };

  // If already logged in, don't show login page
  onMount(() => {
    if (!browser) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        goto('/');
      }
    } catch {
      // ignore
    }
  });

  const goRegister = () => goto('/auth/register');
</script>

<div class="space-y-6">
  <header class="space-y-2 text-center">
    <div class="text-[11px] uppercase tracking-[0.25em] text-emerald-400/80">
      Wardex Guard
    </div>
    <h1 class="text-xl font-semibold">Sign in</h1>
    <p class="text-xs text-slate-400">
      Use your Wardex demo account to access your doors.
    </p>
  </header>

  <form class="space-y-4" on:submit|preventDefault={submit}>
    {#if error}
      <div class="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
        {error}
      </div>
    {/if}

    <div class="space-y-1">
      <label class="text-xs text-slate-300">Email</label>
      <input
        type="email"
        class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50"
        placeholder="you@example.com"
        bind:value={email}
        required
      />
    </div>

    <div class="space-y-1">
      <label class="text-xs text-slate-300">Password</label>
      <input
        type="password"
        class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50"
        placeholder="••••••••"
        bind:value={password}
        required
      />
    </div>

    <button
      type="submit"
      class="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2.5 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors disabled:opacity-60"
      disabled={loading}
    >
      {#if loading}
        Signing in...
      {:else}
        Sign in
      {/if}
    </button>
  </form>

  <div class="text-center text-xs text-slate-400 space-y-1">
    <p>Need a demo account?</p>
    <button
      class="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
      on:click={goRegister}
    >
      Create one
    </button>
  </div>
</div>
