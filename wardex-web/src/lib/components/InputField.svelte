<script lang="ts">
  import { cn } from "$lib/utils/cn";
  import type { HTMLInputAttributes } from "svelte/elements";

  export let label = "";
  export let type: HTMLInputAttributes["type"] = "text";
  export let placeholder = "";
  export let id: string | undefined;
  export let value = "";
  export let required: boolean = false;
  export let containerClass = "";

  export let inputClass = "";

  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  const hasIcon = Object.keys($$slots).includes("icon");
</script>

<div class={cn("flex w-full flex-col gap-1.5", containerClass)}>
  {#if label}
    <label for={inputId} class="text-sm leading-5 tracking-[-0.15px] text-[#D4D4D4]">
      {label}
    </label>
  {/if}

  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3">
      <slot name="icon" />
    </div>

    <input
      id={inputId}
      {type}
      bind:value
      {placeholder}
      class={cn(
        "h-[50px] w-full rounded-[14px] border border-white/10 bg-[#171717]/60 py-3 pr-4 pl-10 text-white backdrop-blur-[25px] placeholder:text-white/25 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        hasIcon ? "pl-10" : "pl-4",
        inputClass
      )}
      {required}
    />
  </div>
</div>
