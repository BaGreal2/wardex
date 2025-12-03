<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/state";
  import { api, API_BASE } from "$lib/api";
  import { cn } from "$lib/utils/cn";
  import ArrowLeft from "$lib/icons/ArrowLeft.svelte";
  import HomeIcon from "$lib/icons/HomeIcon.svelte";
  import { lastSeen } from "$lib/utils/lastSeen";
  import WifiIcon from "$lib/icons/WifiIcon.svelte";
  import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
  import BellIcon from "$lib/icons/BellIcon.svelte";
  import ChevronRightIcon from "$lib/icons/ChevronRightIcon.svelte";
  import Button from "$lib/components/Button.svelte";
  import ShareIcon from "$lib/icons/ShareIcon.svelte";
  import PowerIcon from "$lib/icons/PowerIcon.svelte";
  import { format } from "date-fns";
  import CopyIcon from "$lib/icons/CopyIcon.svelte";
  import PersonIcon from "$lib/icons/PersonIcon.svelte";
  import { auth } from "$lib/stores/auth";
  import AlarmFillIcon from "$lib/icons/AlarmFillIcon.svelte";
  import DoorIcon from "$lib/icons/DoorIcon.svelte";
  import { goto } from "$app/navigation";
  import { showDeviceUpdatedNotification } from "$lib/notifications";

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
    deviceKey: string | null;
    alarmEnabled: boolean | null;
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

  type AllEvent = DoorEvent | AlarmEvent;

  let device: DeviceDetail | null = $state(null);
  let events: DoorEvent[] = $state([]);
  let alarmEvents: AlarmEvent[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let tab: "info" | "users" | "actions" = $state("info");
  const allEvents: AllEvent[] = $derived(
    [...events, ...alarmEvents].sort((a, b) => b.ts.localeCompare(a.ts))
  );

  let ws: WebSocket | null = null;

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

  const deleteDevice = async () => {
    if (!deviceId) return;

    try {
      await api.delete(`/api/devices/${deviceId}`);
      goto("/");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAlarm = async () => {
    if (!device || !deviceId) return;
    try {
      const nextEnabled = !Boolean(device.alarmEnabled);

      await api.post<{ ok: boolean }>(`/api/devices/${deviceId}/alarm`, {
        action: nextEnabled ? "on" : "off"
      });

      device = { ...device, alarmEnabled: nextEnabled };

      alarmEvents = await api.get<AlarmEvent[]>(`/api/devices/${deviceId}/alarm-events`);
    } catch (e) {
      console.error(e);
    }
  };

  const copy = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const email = $derived($auth.user?.email ?? null);

  onMount(() => {
    loadAll();

    const api = new URL(API_BASE);
    const wsProtocol = api.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${api.host}/ws/devices`;

    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "device-updated" && data.deviceId === deviceId) {
          const updatedId: string = data.deviceId;

          showDeviceUpdatedNotification({
            id: updatedId,
            name: device?.name,
            lastAlarmState: device?.lastAlarmState
          });
          loadAll();
        }
      } catch (err) {
        console.error("WS message parse error", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };
  });

  onDestroy(() => {
    ws?.close();
    ws = null;
  });
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

<div class="relative z-20 flex min-h-dvh flex-col gap-[11px] px-6 pt-6 pb-34">
  {#if loading}
    <div class="mx-auto mt-10 text-lg text-white">Loading device...</div>
  {:else if error}
    <div
      class="mt-10 rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200"
    >
      {error}
    </div>
  {:else if device}
    <header class="flex flex-col items-center gap-9">
      <div class="flex w-full flex-col items-center gap-0.5">
        <div class="w-full">
          <a
            href="/"
            onclick={(e: any) => {
              e.preventDefault();
              goto("/");
            }}
            class="flex size-10 p-2"
          >
            <ArrowLeft class="size-6 text-[#A1A1A1]" />
          </a>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div
            class={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full backdrop-blur-[25px]",
              device.lastAlarmState === "alarm"
                ? "bg-[#FB2C36]/20 text-[#FF6467]"
                : "bg-[#27272A] text-[#9F9FA9]"
            )}
          >
            <HomeIcon class="size-5" />
          </div>
          <h2 class="max-w-[220px] truncate text-2xl font-semibold tracking-[-0.45px]">
            {device.name}
          </h2>
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-end gap-2">
              <span
                class={cn(
                  "size-1.5 rounded-full",
                  device.isOnline ? "bg-[#00D492]" : "bg-[#9F9FA9]",
                  device.lastAlarmState === "alarm" && "bg-[#FF6467]"
                )}
              ></span>
              <span
                class={cn(
                  "text-xs leading-4",
                  device.isOnline ? "text-[#00D492]" : "text-[#9F9FA9]",
                  device.lastAlarmState === "alarm" && "text-[#FF6467]"
                )}
              >
                {#if device.lastAlarmState === "alarm"}
                  ALARM
                {:else if device.alarmEnabled}
                  ARMED
                {:else}
                  {device.isOnline === true ? "IDLE" : "OFFLINE"}
                {/if}
              </span>
            </div>
            <div class="leading-7 tracking-[-0.31px] text-white/65">•</div>
            <div class="-mt-[3px] text-sm leading-5 font-light tracking-[-0.31px] text-white/65">
              {#if device.lastSeenAt}
                {lastSeen(device.lastSeenAt)}
              {:else}
                Never seen
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full gap-2">
        <div
          class="flex basis-1/3 flex-col gap-1 rounded-[14px] bg-white/5 px-4 py-3.5 backdrop-blur-[25px]"
        >
          <span class="text-[10px] leading-[15px] font-thin tracking-[0.12px] text-[#99A1AF]"
            >Battery</span
          >
          <span class="text-sm leading-5 font-thin tracking-[-0.15px] text-white">
            {#if device.lastBattery !== null}
              {Math.round(device.lastBattery)}%
            {:else}
              –
            {/if}
          </span>
        </div>
        <div
          class="flex basis-1/3 flex-col gap-1 rounded-[14px] bg-white/5 px-4 py-3.5 backdrop-blur-[25px]"
        >
          <span class="text-[10px] leading-[15px] font-thin tracking-[0.12px] text-[#99A1AF]"
            >Door</span
          >
          <span class="text-sm leading-5 font-thin tracking-[-0.15px] text-white">
            {#if device.lastDoorState !== null}
              {#if device.lastDoorState === "open"}
                🔑 Opened
              {:else}
                🔒 Closed
              {/if}
            {:else}
              Unknown
            {/if}
          </span>
        </div>
        <div
          class="flex basis-1/3 flex-col gap-1 rounded-[14px] bg-white/5 px-4 py-3.5 backdrop-blur-[25px]"
        >
          <span class="text-[10px] leading-[15px] font-thin tracking-[0.12px] text-[#99A1AF]"
            >Connection</span
          >
          <span class="text-sm leading-5 font-thin tracking-[-0.15px] text-white">
            <WifiIcon class="size-4 text-white" />
          </span>
        </div>
      </div>
    </header>

    <div class="space-y-5">
      <div class="flex justify-between gap-2">
        <div class="flex h-[38px] items-center gap-1 text-xs leading-4">
          <button
            class={cn(
              "h-full flex-1 border-b-2 border-transparent px-1.5 text-center transition-colors",
              tab === "info" ? "border-white text-white" : "text-white/45"
            )}
            onclick={() => (tab = "info")}
          >
            Info
          </button>
          <button
            class={cn(
              "h-full flex-1 border-b-2 border-transparent px-1.5 text-center transition-colors",
              tab === "users" ? "border-white text-white" : "text-white/45"
            )}
            onclick={() => (tab = "users")}
          >
            Users
          </button>
          <button
            class={cn(
              "h-full flex-1 border-b-2 border-transparent px-1.5 text-center transition-colors",
              tab === "actions" ? "border-white text-white" : "text-white/45"
            )}
            onclick={() => (tab = "actions")}
          >
            Actions
          </button>
        </div>

        <button
          class="flex items-center gap-2.5 text-xs leading-4 text-[#FF6467]"
          onclick={deleteDevice}
        >
          Delete Device
          <DeleteIcon class="size-3.5" />
        </button>
      </div>

      {#if tab === "info"}
        <div class="flex flex-col gap-2.5">
          <div
            class="relative flex w-full flex-col gap-3 rounded-[14px] border border-white/5 bg-white/5 px-3.5 py-4 backdrop-blur-[25px]"
          >
            <span class="text-xs leading-4 text-white/65">Actions</span>
            <div class="flex flex-col gap-1">
              <button
                class={cn(
                  "relative rounded-[14px] border bg-[#FB2C36]/20 px-3 py-[11px]",
                  device.lastAlarmState === "alarm"
                    ? "border-[#FF6467] bg-[#FB2C36]/20"
                    : "border-transparent bg-[#FB2C36]/60"
                )}
                onclick={toggleAlarm}
              >
                <span
                  class={cn(
                    "absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-10"
                  )}
                ></span>
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <BellIcon class="size-4 text-white" />
                    <span class="text-sm leading-5 tracking-[-0.15px] text-white">
                      {#if device.lastAlarmState === "alarm"}
                        Turn Off Alarm
                      {:else if device.alarmEnabled}
                        Disable Alarm
                      {:else}
                        Enable Alarm
                      {/if}
                    </span>
                  </div>
                  <ChevronRightIcon class="size-4 text-white" />
                </div>
              </button>
              <Button
                variant="secondary"
                class="h-[unset] w-full px-3 py-2.5 text-sm leading-5 font-normal tracking-[-0.15px]"
                disabled={true}
              >
                <div class="flex size-full items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <ShareIcon class="size-4" />
                    Share Access
                  </div>
                </div>
                <ChevronRightIcon class="size-4 text-white" />
              </Button>
              <Button
                variant="secondary"
                class="h-[unset] w-full px-3 py-2.5 text-sm leading-5 font-normal tracking-[-0.15px]"
                disabled={true}
              >
                <div class="flex size-full items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <PowerIcon class="size-4" />
                    Disable Device
                  </div>
                </div>
                <ChevronRightIcon class="size-4 text-white" />
              </Button>
            </div>
          </div>
          <div
            class="relative flex w-full flex-col gap-3 rounded-[14px] border border-white/5 bg-white/5 px-4 py-3.5 backdrop-blur-[25px]"
          >
            <span class="text-xs leading-4 text-white/65">Device Information</span>
            <div class="flex flex-col gap-2.5">
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85"
                  >Installed</span
                >
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white"
                  >{format(device.createdAt, "MMM dd, yyyy")}</span
                >
              </div>
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85"
                  >Room</span
                >
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white"
                  >{device.roomName}</span
                >
              </div>
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85"
                  >Firmware</span
                >
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white">2.4.1</span
                >
              </div>
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85"
                  >Last update</span
                >
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white">
                  {lastSeen(device.createdAt)}
                </span>
              </div>
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85">
                  ID
                </span>
                <div class="flex w-4/5 items-center gap-1">
                  <span
                    class="flex-1 truncate text-right text-sm leading-5 font-light tracking-[-0.15px] text-white"
                  >
                    {device.id}
                  </span>
                  <button
                    type="button"
                    class="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/10"
                    onclick={() => copy(device?.id ?? "")}
                    aria-label="Copy ID"
                  >
                    <CopyIcon class="size-4 text-white/80" />
                  </button>
                </div>
              </div>
              <div class="flex h-8 items-center justify-between">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/85">
                  Key
                </span>

                <div class="flex w-4/5 items-center gap-1">
                  <span
                    class="flex-1 truncate text-right text-sm leading-5 font-light tracking-[-0.15px] text-white"
                  >
                    {#if device.deviceKey !== null}
                      {device.deviceKey}
                    {:else}
                      -
                    {/if}
                  </span>

                  <button
                    type="button"
                    class="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    onclick={() => copy(device?.deviceKey ?? "")}
                    aria-label="Copy key"
                    disabled={!device.deviceKey}
                  >
                    <CopyIcon class="size-4 text-white/80" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if tab === "users"}
        <div
          class="relative flex w-full flex-col gap-3 rounded-[14px] border border-white/5 bg-white/5 px-3.5 py-4 backdrop-blur-[25px]"
        >
          <span class="text-xs leading-4 text-white/65">User List</span>
          <div class="flex w-full items-center gap-2.5 py-2.5">
            <div class="flex size-8 items-center justify-center rounded-full bg-white/10">
              <PersonIcon class="size-4 text-white" />
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-light tracking-[-0.15px] text-white">John Doe</span>
                <div
                  class="flex h-[15px] items-center rounded-full bg-[#2B7FFF]/20 px-1.5 text-[10px] font-light tracking-[0.12px] text-[#51A2FF]"
                >
                  Owner
                </div>
              </div>
              <span class="text-xs leading-4 font-light text-[#99A1AF]">{email}</span>
              <span class="text-[10px] leading-4 font-light tracking-[0.12px] text-[#6A7282]"
                >Added {format(device.createdAt, "MMM dd, yyy")}</span
              >
            </div>
          </div>
          <Button
            class="h-[unset] rounded-[10px] py-2 text-sm leading-5 font-medium tracking-[-0.15px]"
            disabled={true}>+ Add User</Button
          >
        </div>
      {/if}

      {#if tab === "actions"}
        <div class="flex w-full flex-col gap-3">
          {#each allEvents as event}
            {#if event.eventType === "alarm_triggered"}
              <!-- TRIGGERED card -->
              <div
                class="relative flex w-full justify-between rounded-3xl border border-[#FF6467] bg-[#FB2C36]/20 p-4 backdrop-blur-[25px]"
              >
                <span
                  class={cn(
                    "absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-10"
                  )}
                ></span>
                <div class="relative z-10 flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-[#FB2C36]/20"
                  >
                    <AlarmFillIcon class="size-5 text-[#FF6467]" />
                  </div>
                  <div class="flex flex-col">
                    <span class="leading-5 font-medium tracking-[-0.31px]">Alarm</span>
                    <span class="text-xs leading-4 font-light text-white/45">
                      System • {format(event.ts, "MMM dd, yyy")}
                    </span>
                  </div>
                </div>
                <div
                  class="relative z-10 flex h-11 w-[104px] items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4"
                >
                  <div class="size-1.5 shrink-0 rounded-full bg-white" />
                  <span class="text-[10px] leading-3 font-medium">VIBRATION DETECTED</span>
                </div>
              </div>
            {:else if event.eventType === "alarm_armed"}
              <div
                class="relative flex w-full justify-between rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-[25px]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-[#51A2FF]/25"
                  >
                    <AlarmFillIcon class="size-5 text-[#51A2FF]" />
                  </div>
                  <div class="flex flex-col">
                    <span class="leading-5 font-medium tracking-[-0.31px]">Alarm Armed</span>
                    <span class="text-xs leading-4 font-light text-white/45">
                      System • {format(event.ts, "MMM dd, yyy")}
                    </span>
                  </div>
                </div>
              </div>
            {:else if event.eventType === "alarm_disarmed"}
              <div
                class="relative flex w-full justify-between rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-[25px]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-[#51A2FF]/25"
                  >
                    <AlarmFillIcon class="size-5 text-[#51A2FF]" />
                  </div>
                  <div class="flex flex-col">
                    <span class="leading-5 font-medium tracking-[-0.31px]">Alarm Disabled</span>
                    <span class="text-xs leading-4 font-light text-white/45">
                      System • {format(event.ts, "MMM dd, yyy")}
                    </span>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="relative flex w-full justify-between rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-[25px]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-[#51A2FF]/25"
                  >
                    <DoorIcon class="size-5 text-[#51A2FF]" />
                  </div>
                  <div class="flex flex-col">
                    <span class="leading-5 font-medium tracking-[-0.31px]"
                      >Door {event.doorState === "open" ? "Unlocked" : "Locked"}</span
                    >
                    <span class="text-xs leading-4 font-light text-white/45">
                      You • {format(event.ts, "MMM dd, yyy")}
                    </span>
                  </div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
