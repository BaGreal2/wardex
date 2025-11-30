<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  type DeviceSummary = {
    id: string;
    name: string;
    type: string;
    roomName: string | null;
    lastDoorState: string | null;
    lastBattery: number | null;
    lastSeenAt: string | null;
    isOnline: boolean | null;
  };

  let devices: DeviceSummary[] = [];
  let loading = true;
  let error: string | null = null;

  // create form
  let showCreate = false;
  let newName = '';
  let newType = 'home';
  let newRoom = '';

  const loadDevices = async () => {
    loading = true;
    error = null;
    try {
      devices = await api.get<DeviceSummary[]>('/api/devices');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load devices';
    } finally {
      loading = false;
    }
  };

  const submitCreate = async () => {
    if (!newName.trim()) return;
    try {
      const created = await api.post<DeviceSummary>('/api/devices', {
        name: newName.trim(),
        type: newType || 'home',
        roomName: newRoom.trim() || null
      });
      devices = [created, ...devices];
      newName = '';
      newRoom = '';
      showCreate = false;
    } catch (e) {
      console.error(e);
      error = e instanceof Error ? e.message : 'Failed to create device';
    }
  };

  const goToDevice = (id: string) => {
    goto(`/devices/${id}`);
  };

  onMount(loadDevices);
</script>

<div class="space-y-4">
  <!-- Header row -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Devices
      </h2>
      <p class="text-[11px] text-slate-500">
        Your monitored doors and sensors
      </p>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full border border-emerald-500/70
             bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]
             text-emerald-300 hover:bg-emerald-500/20 transition-colors"
      on:click={() => (showCreate = !showCreate)}
    >
      {#if showCreate}
        Cancel
      {:else}
        + Add
      {/if}
    </button>
  </div>

  <!-- Error -->
  {#if error}
    <div class="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
      {error}
    </div>
  {/if}

  <!-- Create form -->
  {#if showCreate}
    <form
      class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 space-y-2 text-xs"
      on:submit|preventDefault={submitCreate}
    >
      <div class="space-y-1">
        <label class="block text-[11px] text-slate-400 uppercase tracking-[0.16em]">
          Name
        </label>
        <input
          class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs
                 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          bind:value={newName}
          placeholder="Front door"
        />
      </div>

      <div class="flex gap-2">
        <div class="flex-1 space-y-1">
          <label class="block text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            Type
          </label>
          <select
            class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs
                   focus:outline-none focus:ring-1 focus:ring-emerald-500"
            bind:value={newType}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="flex-1 space-y-1">
          <label class="block text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            Room
          </label>
          <input
            class="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs
                   focus:outline-none focus:ring-1 focus:ring-emerald-500"
            bind:value={newRoom}
            placeholder="Hallway"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button
          type="button"
          class="text-[11px] text-slate-400 hover:text-slate-200"
          on:click={() => (showCreate = false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-full bg-emerald-500 text-slate-950 text-[11px] font-semibold
                 px-4 py-1.5 uppercase tracking-[0.16em]
                 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400"
          disabled={!newName.trim()}
        >
          Save
        </button>
      </div>
    </form>
  {/if}

  <!-- Devices list -->
  {#if loading}
    <p class="text-sm text-slate-300">Loading devices…</p>
  {:else if devices.length === 0}
    <div class="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-3 py-4 text-xs">
      <p class="text-slate-300 mb-1 font-medium">
        No devices yet
      </p>
      <p class="text-slate-500">
        Tap <span class="text-emerald-300 font-semibold">+ Add</span> to register your first door sensor.
      </p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each devices as d}
        <button
          type="button"
          class="w-full text-left rounded-lg border border-slate-800 bg-slate-900/70
                 px-3 py-3 text-xs flex items-center justify-between
                 hover:border-emerald-500/60 hover:bg-slate-900 transition-colors"
          on:click={() => goToDevice(d.id)}
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">{d.name}</span>
              {#if d.roomName}
                <span class="text-[11px] text-slate-400">· {d.roomName}</span>
              {/if}
            </div>
            <div class="text-[11px] text-slate-500">
              {d.type} ·
              Door: <span class="font-medium text-slate-200">
                {d.lastDoorState ?? 'unknown'}
              </span>
            </div>
          </div>

          <div class="text-right text-[10px] space-y-1">
            <div>
              {#if d.isOnline === true}
                <span class="inline-flex items-center rounded-full bg-emerald-500/10
                             px-2 py-[2px] text-emerald-300">
                  ● Online
                </span>
              {:else if d.isOnline === false}
                <span class="inline-flex items-center rounded-full bg-red-500/10
                             px-2 py-[2px] text-red-300">
                  ● Offline
                </span>
              {:else}
                <span class="text-slate-500">Status unknown</span>
              {/if}
            </div>
            <div class="text-slate-500">
              {#if d.lastBattery !== null}
                🔋 {d.lastBattery.toFixed(0)}%
              {:else}
                🔋 –
              {/if}
            </div>
            <div class="text-slate-500">
              {#if d.lastSeenAt}
                {new Date(d.lastSeenAt).toLocaleTimeString()}
              {:else}
                Never seen
              {/if}
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
