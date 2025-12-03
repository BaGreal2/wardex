<script lang="ts">
  import { api } from "$lib";
  import ChevronDownIcon from "$lib/icons/ChevronDownIcon.svelte";
  import RefreshIcon from "$lib/icons/RefreshIcon.svelte";
  import { onMount } from "svelte";
  import { format, isToday, isSameDay } from "date-fns";
  import AlarmFillIcon from "$lib/icons/AlarmFillIcon.svelte";
  import { cn } from "$lib/utils/cn";
  import DoorIcon from "$lib/icons/DoorIcon.svelte";

  type UserEvent = {
    id: number;
    deviceId: string;
    kind: "door" | "alarm";
    doorState: string | null;
    battery: number | null;
    alarmEnabled: boolean | null;
    alarmEventType: string | null;
    ts: string;
  };

  let allEvents: UserEvent[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  let selectedDate: Date = $state(new Date());
  let showDatepicker: boolean = $state(false);

  let selectedDateLabel: string = $derived(
    (isToday(selectedDate) ? "Today, " : "") + format(selectedDate, "MMM d")
  );

  let events: UserEvent[] = $derived(
    allEvents.filter((e) => isSameDay(new Date(e.ts), selectedDate))
  );

  const loadAll = async () => {
    loading = true;
    error = null;

    try {
      const ev = await api.get<UserEvent[]>(`/api/events`);
      allEvents = ev;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load device";
      allEvents = [];
    } finally {
      loading = false;
    }
  };

  const togglePicker = () => {
    showDatepicker = !showDatepicker;
  };

  const handleDateChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    selectedDate = new Date(value + "T00:00:00");
    showDatepicker = false;
  };

  onMount(loadAll);
</script>

<img
  src="/images/bg-gradient-default.png"
  class="absolute z-0 size-full object-cover md:hidden"
  alt=""
/>

<div class="relative z-20 flex min-h-dvh flex-col justify-between gap-7.5 px-6 pt-10 pb-24">
  <header class="flex items-center justify-between px-4">
    <div>
      <h1 class="text-2xl leading-8 font-semibold">Activity Log</h1>

      <div class="relative inline-block">
        <button class="flex items-center gap-1" onclick={togglePicker}>
          <p class="text-sm leading-5 font-light tracking-[-0.15px] text-white/65">
            {selectedDateLabel}
          </p>
          <ChevronDownIcon class="size-5 text-white/45" />
        </button>

        {#if showDatepicker}
          <div class="absolute top-full left-0 z-20 mt-1">
            <input
              type="date"
              class="rounded border border-[#27272A] bg-[#18181B] px-2 py-1 text-sm text-white/80"
              value={format(selectedDate, "yyyy-MM-dd")}
              onchange={handleDateChange}
            />
          </div>
        {/if}
      </div>
    </div>

    <button
      class="flex size-9 items-center justify-center rounded-full border-[0.61px] border-[#27272A] bg-[#18181B] disabled:opacity-60"
      onclick={loadAll}
      disabled={loading}
    >
      <RefreshIcon class="size-4 text-[#9F9FA9]" />
    </button>
  </header>

  <div class="flex w-full grow flex-col">
    {#if loading}
      <div class="mx-auto mt-2 text-lg text-white">Loading devices...</div>
    {:else if error}
      <div
        class="mt-2 rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200"
      >
        {error}
      </div>
    {:else if events.length === 0}
      <div class="mx-auto mt-2 text-lg text-white">No events for selected date.</div>
    {:else}
      <div class="flex w-full flex-col gap-3">
        {#each events as event}
          {#if event.kind === "alarm"}
            {#if event.alarmEventType === "alarm_on"}
              <div
                class="relative flex w-full justify-between rounded-3xl border border-[#FF6467] bg-[#FB2C36]/20 p-4 backdrop-blur-[25px]"
              >
                <span
                  class={cn(
                    "absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-10"
                  )}
                >
                </span>
                <div class=" relative z-10 flex items-center gap-3">
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
                  <div class="size-1.5 shrink-0 rounded-full bg-white"></div>
                  <span class="text-[10px] leading-3 font-medium">VIBRATION DETECTED</span>
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
            {/if}
          {:else}
            <div
              class="relative flex w-full justify-between rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-[25px]"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-full bg-[#51A2FF]/25">
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
</div>
