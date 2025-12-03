<script lang="ts">
  import { fly } from "svelte/transition";
  import { page } from "$app/state";
  import HouseActiveIcon from "$lib/icons/HouseActiveIcon.svelte";
  import HouseInactiveIcon from "$lib/icons/HouseInactiveIcon.svelte";
  import ProfileActiveIcon from "$lib/icons/ProfileActiveIcon.svelte";
  import ProfileInactiveIcon from "$lib/icons/ProfileInactiveIcon.svelte";
  import ShieldActiveIcon from "$lib/icons/ShieldActiveIcon.svelte";
  import ShieldInactiveIcon from "$lib/icons/ShieldInactiveIcon.svelte";
  import { cn } from "$lib/utils/cn";
  import "./layout.css";
  import { cubicInOut } from "svelte/easing";

  const pathname = $derived(page.url?.pathname ?? "/");
  const isAuthRoute = $derived(pathname.startsWith("/auth"));

  const isDevicesRoute = $derived(pathname === "/" || pathname.startsWith("/devices"));
  const isActivityRoute = $derived(pathname.startsWith("/activity"));
  const isSettingsRoute = $derived(pathname.startsWith("/settings"));

  const activeIndex = $derived(isDevicesRoute ? 0 : isActivityRoute ? 1 : 2);

  let previous = "";
  let direction = $state(1);

  $effect(() => {
    const current = page.url.pathname;

    if (previous && previous !== current) {
      direction = current > previous ? 1 : -1;
    }

    previous = current;
  });
</script>

<svelte:head>
  <title>WARDEX</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="min-h-dvh flex-col">
  <div class="mx-auto w-full max-w-md flex-1 overflow-hidden">
    {#key page.url.pathname}
      <div
        transition:fly={{
          x: direction * 100,
          duration: 200,
          opacity: 0,
          easing: cubicInOut
        }}
        class="h-full"
      >
        <slot />
      </div>
    {/key}
  </div>

  {#if !isAuthRoute}
    <nav class="fixed inset-x-0 bottom-0 z-40 px-4 py-2.5">
      <div
        class="mx-auto h-15 w-full max-w-md rounded-full border border-[#27272A]/50 bg-[#18181B]/90 p-1.5 shadow-xl backdrop-blur-[25px]"
      >
        <div class="relative flex h-full w-full items-center overflow-hidden rounded-full">
          <div
            class="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#27272A] transition-transform duration-300 ease-out"
            style:transform={`translateX(${activeIndex * 100}%)`}
          >
            <div
              class="absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-10"
            ></div>
          </div>

          <a
            href="/"
            class={cn(
              "relative z-10 flex h-full flex-1 basis-1/3 items-center justify-center rounded-full text-center text-[10px] tracking-[0.12px] transition-colors duration-200",
              isDevicesRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isDevicesRoute ? "page" : undefined}
          >
            <div class="relative z-10 flex size-full flex-col items-center justify-center gap-0.5">
              {#if isDevicesRoute}
                <HouseActiveIcon class="size-5" />
              {:else}
                <HouseInactiveIcon class="size-5" />
              {/if}
              <span>Home</span>
            </div>
          </a>

          <a
            href="/activity"
            class={cn(
              "relative z-10 flex h-full flex-1 basis-1/3 items-center justify-center rounded-full text-center text-[10px] tracking-[0.12px] transition-colors duration-200",
              isActivityRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isActivityRoute ? "page" : undefined}
          >
            <div class="relative z-10 flex size-full flex-col items-center justify-center gap-0.5">
              {#if isActivityRoute}
                <ShieldActiveIcon class="size-5" />
              {:else}
                <ShieldInactiveIcon class="size-5" />
              {/if}
              <span>Activity</span>
            </div>
          </a>

          <a
            href="/settings"
            class={cn(
              "relative z-10 flex h-full flex-1 basis-1/3 items-center justify-center rounded-full text-center text-[10px] tracking-[0.12px] transition-colors duration-200",
              isSettingsRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isSettingsRoute ? "page" : undefined}
          >
            <div class="relative z-10 flex size-full flex-col items-center justify-center gap-0.5">
              {#if isSettingsRoute}
                <ProfileActiveIcon class="size-5" />
              {:else}
                <ProfileInactiveIcon class="size-5" />
              {/if}
              <span>Profile</span>
            </div>
          </a>
        </div>
      </div>
    </nav>
  {/if}
</main>

<style global>
  @import "@fontsource/inter/index.css";
</style>
