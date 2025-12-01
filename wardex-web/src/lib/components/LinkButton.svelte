<script lang="ts">
  import { cn } from "$lib/utils/cn";

  export let variant: "primary" | "secondary" = "primary";
</script>

<a
  {...$$restProps}
  class={cn(
    "flex relative justify-center py-4 px-6 overflow-hidden items-center gap-2 text-lg leading-7 tracking-[-0.44px] font-semibold text-center rounded-[14px] border-2",
    variant === "primary"
      ? "text-black bg-white border-black/20"
      : "text-white bg-[#171717]/60 backdrop-blur-[25px] border-white/4",
    $$restProps.class
  )}
>
  <span
    class={cn(
      "absolute left-0 top-0 z-0 size-full opacity-10",
      variant === "primary" ? "bg-radial from-white/0 to-black" : "bg-radial from-white to-white/0"
    )}
  ></span>

  <span class="size-full relative z-10">
    <slot />
  </span>
</a>
