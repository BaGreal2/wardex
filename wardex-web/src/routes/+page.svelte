<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import { cn } from "$lib/utils/cn";

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

  const loadDevices = async () => {
    loading = true;
    error = null;
    try {
      devices = await api.get<DeviceSummary[]>("/api/devices");
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load devices";
    } finally {
      loading = false;
    }
  };

  const openDevice = (id: string) => {
    goto(`/devices/${id}`);
  };

  const goToNewDevice = () => {
    goto("/devices/new");
  };

  onMount(loadDevices);
</script>

<div class="space-y-5">
  <!-- Header -->
  <header class="flex items-center justify-between">
    <div>
      <div class="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 mb-1">
        Wardex Guard
      </div>
      <h1 class="text-xl font-semibold">My doors</h1>
      <p class="text-xs text-slate-400 mt-1">
        Monitor door status, battery and alarms for all your devices.
      </p>
    </div>

    <button
      class="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
      on:click={loadDevices}
      disabled={loading}
    >
      {#if loading}
        Refreshing...
      {:else}
        Refresh
      {/if}
    </button>
  </header>

  <!-- Add device CTA -->
  <button
    class="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
    on:click={goToNewDevice}
  >
    <span class="text-base">+</span>
    <span>Add door device</span>
  </button>

  <!-- Content -->
  {#if loading}
    <div class="mt-6 text-sm text-slate-300">Loading devices...</div>
  {:else if error}
    <div class="mt-4 rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
      {error}
    </div>
  {:else if devices.length === 0}
    <div
      class="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-900/70 px-4 py-5 text-sm text-slate-300"
    >
      <p class="font-medium mb-1">No devices yet</p>
      <p class="text-xs text-slate-400">
        Use “Add door device” above to register the first sensor in your Wardex Guard system.
      </p>
    </div>
  {:else}
    <div class="mt-2 space-y-3">
      {#each devices as d}
        <button
          class="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left shadow-sm hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex items-center justify-between"
          on:click={() => openDevice(d.id)}
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm">{d.name}</span>
              {#if d.roomName}
                <span class="text-[11px] text-slate-400">
                  · {d.roomName}
                </span>
              {/if}
            </div>
            <div class="text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1">
              <span class="uppercase tracking-[0.16em] text-slate-500">
                {d.type}
              </span>
              <span>•</span>
              <span>
                Door:
                <span
                  class={d.lastDoorState === "open"
                    ? "text-amber-300"
                    : d.lastDoorState === "close"
                      ? "text-emerald-300"
                      : "text-slate-300"}
                >
                  {d.lastDoorState ?? "unknown"}
                </span>
              </span>
              <span>•</span>
              <span>
                Battery:
                {#if d.lastBattery !== null}
                  {Math.round(d.lastBattery)}%
                {:else}
                  –
                {/if}
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1 text-[11px]">
            <div class="flex items-center gap-1.5">
              <span
                class={cn(
                  "h-2 w-2 rounded-full",
                  d.isOnline
                    ? "bg-emerald-400"
                    : d.isOnline === false
                      ? "bg-red-400"
                      : "bg-slate-500"
                )}
              ></span>
              <span class="text-slate-400">
                {d.isOnline === true ? "Online" : d.isOnline === false ? "Offline" : "Unknown"}
              </span>
            </div>
            <div class="text-[10px] text-slate-500">
              {#if d.lastSeenAt}
                Seen {new Date(d.lastSeenAt).toLocaleString()}
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
