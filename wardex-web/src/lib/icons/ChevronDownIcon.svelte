<script>
  import { cn } from "$lib/utils/cn";
  import ChevronRightIcon from "./ChevronRightIcon.svelte";
</script>

<ChevronRightIcon {...$$restProps} class={cn("rotate-90", $$restProps.class)} />
