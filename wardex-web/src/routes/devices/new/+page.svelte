<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let name = '';
  let type = 'home';
  let roomName = '';
  let loading = false;
  let error: string | null = null;

  const goBack = () => goto('/');

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = null;

    try {
      const body: { name: string; type?: string; roomName?: string } = { name };
      if (type) body.type = type;
      if (roomName.trim()) body.roomName = roomName.trim();

      const device = await api.post<{ id: string }>('/api/devices', body);
      goto(`/devices/${device.id}`);
    } catch (e) {
      error =
        e instanceof Error ? e.message : 'Failed to create device. Check API.';
    } finally {
      loading = false;
    }
  };
</script>

<div class="space-y-5">
  <div class="flex items-center justify-between">
    <button
      class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300 transition-colors"
      on:click={goBack}
    >
      ← Back
    </button>
    <div class="text-right">
      <div class="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80">
        Wardex Guard
      </div>
      <h1 class="text-lg font-semibold">Add device</h1>
    </div>
  </div>

  <form class="space-y-4" on:submit|preventDefault={submit}>
    {#if error}
      <div class="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
        {error}
      </div>
    {/if}

    <div class="space-y-1">
      <label class="text-xs text-slate-300">Name</label>
      <input
        class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50"
        placeholder="Front door"
        bind:value={name}
        required
      />
    </div>

    <div class="space-y-1">
      <label class="text-xs text-slate-300">Type</label>
      <select
        class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50"
        bind:value={type}
      >
        <option value="home">Home</option>
        <option value="work">Work</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-slate-300">Room (optional)</label>
      <input
        class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50"
        placeholder="Hallway"
        bind:value={roomName}
      />
    </div>

    <p class="text-[11px] text-slate-400">
      When you save, Wardex backend creates a matching IoT Hub device and
      connects it with this record.
    </p>

    <button
      type="submit"
      class="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2.5 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors disabled:opacity-60"
      disabled={loading}
    >
      {#if loading}
        Creating...
      {:else}
        Save device
      {/if}
    </button>
  </form>
</div>
