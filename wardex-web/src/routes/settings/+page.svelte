<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  // derive from store
  $: email = $auth.user?.email ?? null;
  $: userId = $auth.user?.userId ?? null;

  const logout = () => {
    auth.logout();
    goto('/auth/login');
  };
</script>

<div class="space-y-5">
  <header class="space-y-1">
    <div class="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80">
      Wardex Guard
    </div>
    <h1 class="text-xl font-semibold">Settings</h1>
    <p class="text-xs text-slate-400">
      Basic account info and demo controls.
    </p>
  </header>

  <div class="space-y-4">
    <div class="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 space-y-1 text-sm">
      <div class="font-medium text-slate-100">Account</div>
      <div class="text-xs text-slate-400">
        Email:
        <span class="text-slate-200">{email ?? 'unknown'}</span>
      </div>
      <div class="text-[11px] text-slate-500 break-all">
        User ID: {userId ?? 'unknown'}
      </div>
    </div>

    <div class="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 space-y-2 text-xs text-slate-400">
      <div class="font-medium text-slate-100 text-sm">About this demo</div>
      <p>
        This is a simplified Wardex Guard client talking to:
      </p>
      <ul class="list-disc pl-4 space-y-1">
        <li>Fastify REST API with JWT auth</li>
        <li>PostgreSQL storage on Azure VM</li>
        <li>Azure IoT Hub (MQTT) + Functions bridge</li>
      </ul>
    </div>

    <button
      class="w-full rounded-lg border border-red-500/60 bg-red-950/40 text-xs font-semibold py-2 text-red-100 hover:bg-red-500/20 transition-colors"
      on:click={logout}
    >
      Log out
    </button>
  </div>
</div>
