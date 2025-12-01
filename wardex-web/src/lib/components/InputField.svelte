<script lang="ts">
  import { cn } from "$lib/utils/cn";
  import type { HTMLInputAttributes } from "svelte/elements";

  export let label = "";
  export let type: HTMLInputAttributes["type"] = "text";
  export let placeholder = "";
  export let id: string | undefined;
  export let value = "";

  export let inputClass = "";

  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
</script>

<div class="flex flex-col gap-1.5 w-full">
  {#if label}
    <label for={inputId} class="text-sm text-[#D4D4D4] leading-5 tracking-[-0.15px]">
      {label}
    </label>
  {/if}

  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-20">
      <slot name="icon" />
    </div>

    <input
      id={inputId}
      {type}
      bind:value
      {placeholder}
      class={cn(
        "w-full rounded-[14px] backdrop-blur-[25px] border border-white/10 bg-[#171717]/60 font-light py-3 h-[50px] pr-4 pl-10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed",
        inputClass
      )}
    />
  </div>
</div>
