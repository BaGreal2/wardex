<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import { cn } from "$lib/utils/cn";
  import RefreshIcon from "$lib/icons/RefreshIcon.svelte";
  import PlusIcon from "$lib/icons/PlusIcon.svelte";
  import HomeIcon from "$lib/icons/HomeIcon.svelte";
  import BatteryEmptyIcon from "$lib/icons/BatteryEmptyIcon.svelte";
  import BatteryMidIcon from "$lib/icons/BatteryMidIcon.svelte";
  import BatteryFullIcon from "$lib/icons/BatteryFullIcon.svelte";
  import WifiIcon from "$lib/icons/WifiIcon.svelte";
  import { lastSeen } from "$lib/utils/lastSeen";

  type DeviceSummary = {
    id: string;
    name: string;
    type: string;
    roomName: string | null;
    lastDoorState: string | null;
    lastAlarmState: string | null;
    lastBattery: number | null;
    lastSeenAt: string | null;
    isOnline: boolean | null;
  };

  let devices: DeviceSummary[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

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

  const anyHasAlarm = $derived(devices.some((d) => d.lastAlarmState === "alarm"));

  const sortedDevices = $derived([
    ...devices.filter((d) => d.lastAlarmState === "alarm"),
    ...devices.filter((d) => d.lastAlarmState !== "alarm")
  ]);
</script>

{#if anyHasAlarm}
  <img
    src="/images/bg-gradient-red.png"
    class="absolute z-0 size-full object-cover md:hidden"
    alt=""
  />
{:else}
  <img
    src="/images/bg-gradient-default.png"
    class="absolute z-0 size-full object-cover md:hidden"
    alt=""
  />
{/if}

<div class="relative z-20 flex min-h-dvh flex-col justify-between gap-7.5 px-6 pt-10 pb-34">
  <header class="flex items-center justify-between px-4">
    <div>
      <h1 class="text-2xl leading-8 font-semibold">My Devices</h1>
      <div class="flex items-center gap-1">
        <p class="text-sm leading-5 font-light tracking-[-0.15px] text-white/65">Overview</p>
        {#if anyHasAlarm}
          <span class="translate-y-px text-sm leading-5 font-light text-white/65">•</span>
          <span class="text-sm leading-5 font-semibold text-[#FF6467] underline underline-offset-2"
            >ALARM</span
          >
        {/if}
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="flex size-9 items-center justify-center rounded-full border-[0.61px] border-[#27272A] bg-[#18181B] disabled:opacity-60"
        onclick={loadDevices}
        disabled={loading}
      >
        <RefreshIcon class="size-4 text-[#9F9FA9]" />
      </button>
      <button
        class="flex size-9 items-center justify-center rounded-full bg-white"
        onclick={goToNewDevice}
      >
        <PlusIcon class="size-4 text-black" />
      </button>
    </div>
  </header>

  <div class="flex w-full grow flex-col">
    {#if loading}
      <div class="mx-auto mt-10 text-lg text-white">Loading devices...</div>
    {:else if error}
      <div
        class="mt-10 rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200"
      >
        {error}
      </div>
    {:else if devices.length === 0}
      <div class="mx-auto mt-10 text-lg text-white">No devices yet</div>
    {:else}
      <div class="flex flex-col gap-3">
        {#each sortedDevices as d}
          <button
            class={cn(
              "relative h-25 w-full rounded-3xl border-[0.6px] border-[#27272A]/50 p-4 text-left backdrop-blur-[25px]",
              d.lastAlarmState === "alarm" ? "bg-[#FB2C36]/10" : " bg-[#18181B]/80"
            )}
            onclick={() => openDevice(d.id)}
          >
            <div
              class="absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-10"
            ></div>
            <div class="relative z-10 flex size-full flex-col justify-between">
              <div class="flex w-full justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      d.lastAlarmState === "alarm"
                        ? "bg-[#FB2C36]/20 text-[#FF6467]"
                        : "bg-[#27272A] text-[#9F9FA9]"
                    )}
                  >
                    <HomeIcon class="size-5" />
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium tracking-[-0.31px]">{d.name}</span>
                    <span class="text-xs leading-4 text-[#71717B]">
                      <span class="capitalize">{d.type}</span> · 1 user
                    </span>
                  </div>
                </div>

                <div
                  class={cn(
                    "flex h-[21px] items-center gap-1.5 rounded-full border-[0.61px] px-[11px]",
                    d.isOnline
                      ? "border-[#00BC7D]/20 bg-[#00BC7D]/10"
                      : "border-[#71717B]/20 bg-[#71717B]/10",
                    d.lastAlarmState === "alarm" && "border-[#FB2C36]/20 bg-[#FB2C36]/10"
                  )}
                >
                  <span
                    class={cn(
                      "size-1.5 rounded-full",
                      d.isOnline ? "bg-[#00D492]" : "bg-[#9F9FA9]",
                      d.lastAlarmState === "alarm" && "bg-[#FF6467]"
                    )}
                  ></span>
                  <span
                    class={cn(
                      "text-xs leading-4",
                      d.isOnline ? "text-[#00D492]" : "text-[#9F9FA9]",
                      d.lastAlarmState === "alarm" && "text-[#FF6467]"
                    )}
                  >
                    {#if d.lastAlarmState === "alarm"}
                      ALARM
                    {:else}
                      {d.isOnline === true ? "IDLE" : "OFFLINE"}
                    {/if}
                  </span>
                </div>
              </div>
              <div class="flex w-full justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class={cn(
                      "flex items-center gap-1 text-xs font-light",
                      d.lastBattery === null
                        ? "text-[#71717B]"
                        : d.lastBattery < 25
                          ? "text-[#FB2C36]"
                          : d.lastBattery < 75
                            ? "text-[#FDC700]"
                            : "text-[#00D492]"
                    )}
                  >
                    <span>
                      {#if d.lastBattery !== null}
                        {Math.round(d.lastBattery)}%
                      {:else}
                        –
                      {/if}
                    </span>
                    {#if d.lastBattery !== null}
                      {#if d.lastBattery < 25}
                        <BatteryEmptyIcon class="size-3" />
                      {:else if d.lastBattery < 75}
                        <BatteryMidIcon class="size-3" />
                      {:else}
                        <BatteryFullIcon class="size-3" />
                      {/if}
                    {/if}
                  </div>
                  <div class="flex items-center gap-1">
                    <WifiIcon class="size-3 text-white/45" />
                    <span class="text-xs leading-4 font-light text-white/45">Wi-Fi</span>
                  </div>
                </div>

                <div class="text-xs leading-4 font-light text-white/45">
                  {#if d.lastSeenAt}
                    {lastSeen(d.lastSeenAt)}
                  {:else}
                    Never seen
                  {/if}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
