<script lang="ts">
  import { cn } from "$lib/utils/cn";

  export let variant: "primary" | "secondary" = "primary";
</script>

<a
  {...$$restProps}
  class={cn(
    "relative flex items-center justify-center gap-2 overflow-hidden rounded-[14px] border-2 px-6 py-4 text-center text-lg leading-7 font-semibold tracking-[-0.44px]",
    variant === "primary"
      ? "border-black/20 bg-white text-black"
      : "border-white/4 bg-[#171717]/60 text-white backdrop-blur-[25px]",
    $$restProps.class
  )}
>
  <span
    class={cn(
      "absolute top-0 left-0 z-0 size-full opacity-10",
      variant === "primary" ? "bg-radial from-white/0 to-black" : "bg-radial from-white to-white/0"
    )}
  ></span>

  <span class="relative z-10 size-full">
    <slot />
  </span>
</a>
