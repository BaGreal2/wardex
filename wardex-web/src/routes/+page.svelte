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
  import { formatDistanceToNow } from "date-fns";

  const lastSeen = (dateStr: string) => {
    const text = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    if (text.includes("less than a minute")) return "Just now";
    return text;
  };

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
      console.log(devices);
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

<div class="flex justify-between pt-10 pb-24 relative z-20 flex-col min-h-dvh px-6 gap-7.5">
  <header class="flex items-center justify-between px-4">
    <div>
      <h1 class="text-2xl leading-8 font-semibold">My Devices</h1>
      <div class="flex gap-1 items-center">
        <p class="text-sm text-white/65 font-light tracking-[-0.15px] leading-5">Overview</p>
        {#if anyHasAlarm}
          <span class="translate-y-px text-sm leading-5 font-light text-white/65">•</span>
          <span class="text-sm underline-offset-2 leading-5 font-semibold underline text-[#FF6467]"
            >ALARM</span
          >
        {/if}
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="rounded-full border-[0.61px] border-[#27272A] bg-[#18181B] size-9 flex justify-center items-center disabled:opacity-60"
        onclick={loadDevices}
        disabled={loading}
      >
        <RefreshIcon class="size-4 text-[#9F9FA9]" />
      </button>
      <button
        class="rounded-full bg-white size-9 flex justify-center items-center"
        onclick={goToNewDevice}
      >
        <PlusIcon class="size-4 text-black" />
      </button>
    </div>
  </header>

  <div class="flex grow w-full flex-col">
    {#if loading}
      <div class="text-lg text-white mx-auto mt-10">Loading devices...</div>
    {:else if error}
      <div
        class="rounded mt-10 border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200"
      >
        {error}
      </div>
    {:else if devices.length === 0}
      <div class="text-lg text-white mt-10 mx-auto">No devices yet</div>
    {:else}
      <div class="flex flex-col gap-3">
        {#each devices as d}
          <button
            class={cn(
              "relative w-full rounded-3xl border-[0.6px] h-25 border-[#27272A]/50 p-4 text-left backdrop-blur-[25px]",
              d.lastAlarmState === "alarm" ? "bg-[#FB2C36]/10" : " bg-[#18181B]/80"
            )}
            onclick={() => openDevice(d.id)}
          >
            <div
              class="absolute left-0 top-0 z-0 size-full opacity-10 bg-radial from-white to-white/0"
            ></div>
            <div class="relative z-10 size-full flex flex-col justify-between">
              <div class="flex justify-between w-full">
                <div class="gap-3 flex items-center">
                  <div
                    class={cn(
                      "rounded-full flex justify-center items-center shrink-0 size-10",
                      d.lastAlarmState === "alarm"
                        ? "bg-[#FB2C36]/20 text-[#FF6467]"
                        : "bg-[#27272A] text-[#9F9FA9]"
                    )}
                  >
                    <HomeIcon class="size-5" />
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium tracking-[-0.31px]">{d.name}</span>
                    <span class="text-[#71717B] leading-4 text-xs">
                      <span class="capitalize">{d.type}</span> · 1 user
                    </span>
                  </div>
                </div>

                <div
                  class={cn(
                    "flex items-center gap-1.5 rounded-full px-[11px] border-[0.61px] h-[21px]",
                    d.isOnline
                      ? "bg-[#00BC7D]/10 border-[#00BC7D]/20"
                      : "bg-[#71717B]/10 border-[#71717B]/20",
                    d.lastAlarmState === "alarm" && "bg-[#FB2C36]/10 border-[#FB2C36]/20"
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
              <div class="flex justify-between w-full">
                <div class="flex gap-4 items-center">
                  <div
                    class={cn(
                      "flex gap-1 text-xs font-light items-center",
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
                    <span class="text-white/45 text-xs leading-4 font-light">Wi-Fi</span>
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
