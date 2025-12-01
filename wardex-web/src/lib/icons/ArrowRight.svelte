<script>
  import { cn } from "$lib/utils/cn";
  import ArrowLeft from "./ArrowLeft.svelte";
</script>

<ArrowLeft {...$$restProps} class={cn("rotate-180", $$restProps.class)} />
