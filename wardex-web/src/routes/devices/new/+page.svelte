<script lang="ts">
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import InputField from "$lib/components/InputField.svelte";
  import ArrowLeft from "$lib/icons/ArrowLeft.svelte";
  import ArrowRight from "$lib/icons/ArrowRight.svelte";
  import { cn } from "$lib/utils/cn";

  let name = "";
  let roomName = "";
  let loading = false;
  let error: string | null = null;

  const options = [
    { value: "home", label: "Home" },
    { value: "office", label: "Office" },
    { value: "garage", label: "Garage" },
    { value: "warehouse", label: "Warehouse" },
    { value: "other", label: "Other" }
  ] as const;

  let type: (typeof options)[number]["value"] = "home";

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = null;

    try {
      const body: { name: string; type?: string; roomName?: string } = { name };
      if (type) body.type = type;
      if (roomName.trim()) body.roomName = roomName.trim();

      const device = await api.post<{ id: string }>("/api/devices", body);
      goto(`/devices/${device.id}`);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to create device. Check API.";
    } finally {
      loading = false;
    }
  };
</script>

<img
  src="/images/bg-gradient-default.png"
  class="absolute z-0 size-full object-cover md:hidden"
  alt=""
/>

<div class="relative z-20 flex min-h-dvh flex-col gap-[11px] px-6 pt-10 pb-10">
  <header class="flex flex-col items-center gap-9">
    <div class="flex w-full flex-col items-center gap-2">
      <h1 class="text-xl leading-7 font-semibold tracking-[-0.45px] text-white">Device Setup</h1>
      <span class="text-sm leading-5 font-light tracking-[-0.15px] text-white/65"
        >Customize your new device</span
      >

      <a
        href="/"
        onclick={(e: any) => {
          e.preventDefault();
          goto("/");
        }}
        class="absolute top-8 left-6 flex size-10 p-2"
      >
        <ArrowLeft class="size-6 text-[#A1A1A1]" />
      </a>
    </div>
  </header>

  <form class="flex grow flex-col justify-between" onsubmit={submit}>
    <div class="flex flex-col gap-6">
      {#if error}
        <div class="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      {/if}

      <InputField
        id="name"
        label="Device Name"
        type="text"
        placeholder="e.g. Front Door"
        bind:value={name}
        required
        containerClass="gap-2.5"
      />

      <div class="flex flex-col gap-2.5">
        <label for="location" class="text-sm leading-5 tracking-[-0.15px] text-[#D4D4D4]">
          Type
        </label>

        <div class="grid grid-cols-3 gap-2">
          {#each options as option}
            <button
              type="button"
              onclick={() => (type = option.value)}
              class={cn(
                "basis-1/3 rounded-full border px-4 py-2 text-sm leading-4 backdrop-blur-[25px] transition",
                type === option.value
                  ? "border-black/20 bg-white font-medium text-black"
                  : "border-white/10 bg-[#171717]/60 text-white"
              )}
            >
              {option.label}
            </button>
          {/each}
        </div>

        <select id="location" bind:value={type} class="hidden">
          {#each options as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <InputField
        id="room_name"
        label="Room Name (Optional)"
        type="text"
        placeholder="e.g. Living Room"
        containerClass="gap-2.5"
        bind:value={roomName}
      />
    </div>

    <div class="flex items-center gap-2">
      <Button variant="secondary">
        <ArrowLeft class="size-[18px]" />
        Back
      </Button>
      <Button type="submit" disabled={loading || !type || !name} class="basis-3/5">
        {#if loading}
          Creating...
        {:else}
          Finish
        {/if}
        <ArrowRight class="size-[18px]" />
      </Button>
    </div>
  </form>
</div>
