<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { auth, type AuthUser } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let loading = false;
  let error: string | null = null;

  type RegisterResponse = {
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
      const res = await api.post<RegisterResponse>('/api/auth/register', {
        email,
        password
      });

      const user: AuthUser = {
        email: res.user?.email ?? email,
        userId: res.user?.userId ?? res.user?.id ?? ''
      };

      auth.login(res.token, user);
      goto('/');
    } catch (e) {
      error =
        e instanceof Error ? e.message : 'Registration failed. Try again.';
    } finally {
      loading = false;
    }
  };

  const goLogin = () => goto('/auth/login');
</script>

<div class="space-y-6">
  <header class="space-y-2 text-center">
    <div class="text-[11px] uppercase tracking-[0.25em] text-emerald-400/80">
      Wardex Guard
    </div>
    <h1 class="text-xl font-semibold">Create demo account</h1>
    <p class="text-xs text-slate-400">
      Register a simple demo account to use with the Wardex backend.
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
        placeholder="At least 8 characters"
        bind:value={password}
        minlength="8"
        required
      />
    </div>

    <button
      type="submit"
      class="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2.5 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors disabled:opacity-60"
      disabled={loading}
    >
      {#if loading}
        Creating...
      {:else}
        Create account
      {/if}
    </button>
  </form>

  <div class="text-center text-xs text-slate-400 space-y-1">
    <p>Already have an account?</p>
    <button
      class="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
      on:click={goLogin}
    >
      Sign in
    </button>
  </div>
</div>
