<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import { cn } from "$lib/utils/cn";

  const deviceId = $derived(page.params.id);

  type DeviceDetail = {
    id: string;
    name: string;
    type: string;
    roomName: string | null;
    wifiSsid: string | null;
    isEnabled: boolean;
    lastDoorState: string | null;
    lastBattery: number | null;
    lastSeenAt: string | null;
    isOnline: boolean | null;
    createdAt: string;
    lastAlarmState?: string | null;
  };

  type DoorEvent = {
    id: number;
    doorState: string;
    battery: number | null;
    alarmEnabled: boolean | null;
    ts: string;
  };

  type AlarmEvent = {
    id: number;
    eventType: string;
    ts: string;
  };

  let device: DeviceDetail | null = $state(null);
  let events: DoorEvent[] = $state([]);
  let alarmEvents: AlarmEvent[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let tab: "events" | "alarms" = $state("events");
  let togglingAlarm = $state(false);

  const loadAll = async () => {
    loading = true;
    error = null;

    try {
      const [d, ev, aev] = await Promise.all([
        api.get<DeviceDetail>(`/api/devices/${deviceId}`),
        api.get<DoorEvent[]>(`/api/devices/${deviceId}/events`),
        api.get<AlarmEvent[]>(`/api/devices/${deviceId}/alarm-events`)
      ]);

      device = d;
      events = ev;
      alarmEvents = aev;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load device";
      device = null;
      events = [];
      alarmEvents = [];
    } finally {
      loading = false;
    }
  };

  const goBack = () => goto("/");

  const toggleAlarm = async () => {
    if (!device || !deviceId) return;
    togglingAlarm = true;
    try {
      const action = device.lastAlarmState === "alarm" ? "off" : "on";

      const res = await api.post<{
        ok: boolean;
        alarmState: "alarm" | "idle";
      }>(`/api/devices/${deviceId}/alarm`, { action });

      device = { ...device, lastAlarmState: res.alarmState };
      alarmEvents = await api.get<AlarmEvent[]>(`/api/devices/${deviceId}/alarm-events`);
    } catch (e) {
      console.error(e);
    } finally {
      togglingAlarm = false;
    }
  };

  onMount(loadAll);
</script>

{#if device?.lastAlarmState === "alarm"}
  <img
    src="/images/bg-gradient-red-bright.png"
    class="absolute z-0 size-full object-cover md:hidden"
    alt=""
  />
{:else}
  <img
    src="/images/bg-gradient-default-bright.png"
    class="absolute z-0 size-full object-cover md:hidden"
    alt=""
  />
{/if}

<div class="relative z-20 flex min-h-dvh flex-col justify-between gap-7.5 px-6 pt-10 pb-24">
  <header class="flex flex-col items-center justify-between px-4"></header>

  {#if loading}
    <p class="text-sm text-slate-300">Loading device...</p>
  {:else if error}
    <div class="space-y-4">
      <button
        class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300"
        onclick={goBack}
      >
        ← Back
      </button>
      <div class="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
        {error}
      </div>
    </div>
  {:else if device}
    <div class="space-y-5">
      <div class="flex items-center justify-between gap-3">
        <button
          class="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-emerald-300"
          onclick={goBack}
        >
          ← Back
        </button>

        <div class="text-right">
          <div class="text-[11px] tracking-[0.2em] text-emerald-400/80 uppercase">Wardex Guard</div>
          <h2 class="max-w-[220px] truncate text-lg font-semibold">
            {device.name}
          </h2>
        </div>
      </div>

      <!-- Status card -->
      <div class="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <span class="tracking-[0.16em] text-slate-500 uppercase">
                {device.type}
              </span>
              {#if device.roomName}
                <span>· {device.roomName}</span>
              {/if}
            </div>
            <div class="text-sm">
              Door:
              <span
                class={device.lastDoorState === "open"
                  ? "font-semibold text-amber-300"
                  : device.lastDoorState === "close"
                    ? "font-semibold text-emerald-300"
                    : "text-slate-200"}
              >
                {device.lastDoorState ?? "unknown"}
              </span>
            </div>
          </div>

          <div class="space-y-1 text-right text-xs text-slate-400">
            <div class="flex items-center justify-end gap-1">
              <span
                class={cn(
                  "h-2 w-2 rounded-full",
                  device.isOnline
                    ? "bg-emerald-400"
                    : device.isOnline === false
                      ? "bg-red-400"
                      : "bg-slate-500"
                )}
              ></span>
              <span>
                {device.isOnline === true
                  ? "Online"
                  : device.isOnline === false
                    ? "Offline"
                    : "Unknown"}
              </span>
            </div>
            <div>
              🔋
              {#if device.lastBattery !== null}
                {Math.round(device.lastBattery)}%
              {:else}
                –
              {/if}
            </div>
          </div>
        </div>

        <div class="space-y-1 text-[11px] text-slate-500">
          <div>
            Last seen:
            {#if device.lastSeenAt}
              {new Date(device.lastSeenAt).toLocaleString()}
            {:else}
              never
            {/if}
          </div>
          <div>
            Wi‑Fi:
            {device.wifiSsid ?? "not set"}
          </div>
          <div>
            Created:
            {new Date(device.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <!-- Alarm control -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Alarm</span>
          <button
            class={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors  disabled:opacity-60",
              device.lastAlarmState === "alarm"
                ? "bg-red-500 text-slate-950 hover:bg-red-400"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            )}
            onclick={toggleAlarm}
            disabled={togglingAlarm}
          >
            {#if togglingAlarm}
              Working...
            {:else if device.lastAlarmState === "alarm"}
              Disable alarm
            {:else}
              Enable alarm
            {/if}
          </button>
        </div>
        <p class="text-[11px] text-slate-400">
          When alarm is enabled and the door opens, the device simulator prints “ALARM TRIGGERED”
          and alarm events are stored in Wardex backend.
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-800 text-sm">
        <button
          class={cn(
            "flex-1 py-2 text-center transition-colors",
            tab === "events" ? "border-b-2 border-emerald-400 text-emerald-300" : "text-slate-400"
          )}
          onclick={() => (tab = "events")}
        >
          Door events
        </button>
        <button
          class={cn(
            "flex-1 py-2 text-center transition-colors",
            tab === "alarms" ? "border-b-2 border-emerald-400 text-emerald-300" : "text-slate-400"
          )}
          onclick={() => (tab = "alarms")}
        >
          Alarm history
        </button>
      </div>

      <!-- Lists -->
      {#if tab === "events"}
        {#if events.length === 0}
          <p class="text-sm text-slate-400">No events yet.</p>
        {:else}
          <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
            {#each events as ev}
              <div
                class="flex justify-between rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
              >
                <div class="space-y-0.5">
                  <div>
                    Door:
                    <span class="font-semibold">{ev.doorState}</span>
                  </div>
                  <div>
                    Battery:
                    {#if ev.battery !== null}
                      {Math.round(ev.battery)}%
                    {:else}
                      –
                    {/if}
                  </div>
                  <div>
                    Alarm enabled:
                    {ev.alarmEnabled === true ? "yes" : "no"}
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-400">
                  {new Date(ev.ts).toLocaleString()}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {:else if alarmEvents.length === 0}
        <p class="text-sm text-slate-400">No alarm events yet.</p>
      {:else}
        <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
          {#each alarmEvents as ev}
            <div
              class="flex justify-between rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
            >
              <div class="font-semibold capitalize">
                {ev.eventType.replace("_", " ")}
              </div>
              <div class="text-right text-[11px] text-slate-400">
                {new Date(ev.ts).toLocaleString()}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
