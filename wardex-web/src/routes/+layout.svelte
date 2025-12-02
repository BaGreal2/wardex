<script lang="ts">
  import { page } from "$app/state";
  import HouseActiveIcon from "$lib/icons/HouseActiveIcon.svelte";
  import HouseInactiveIcon from "$lib/icons/HouseInactiveIcon.svelte";
  import ProfileActiveIcon from "$lib/icons/ProfileActiveIcon.svelte";
  import ProfileInactiveIcon from "$lib/icons/ProfileInactiveIcon.svelte";
  import ShieldActiveIcon from "$lib/icons/ShieldActiveIcon.svelte";
  import ShieldInactiveIcon from "$lib/icons/ShieldInactiveIcon.svelte";
  import { cn } from "$lib/utils/cn";
  import "./layout.css";

  const pathname = $derived(page.url?.pathname ?? "/");
  const isAuthRoute = $derived(pathname.startsWith("/auth"));

  const isDevicesRoute = $derived(pathname === "/" || pathname.startsWith("/devices"));
  const isActivityRoute = $derived(pathname.startsWith("/activity"));
  const isSettingsRoute = $derived(pathname.startsWith("/settings"));

  const activeIndex = $derived(isDevicesRoute ? 0 : isActivityRoute ? 1 : 2);
</script>

<svelte:head>
  <title>WARDEX</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="min-h-dvh flex-col">
  <div class={cn("flex-1 mx-auto w-full max-w-md")}>
    <slot />
  </div>

  <!-- Bottom nav (hidden on auth) -->
  {#if !isAuthRoute}
    <nav class="fixed inset-x-0 bottom-0 py-2.5 px-4 z-40">
      <div
        class="mx-auto w-full h-15 max-w-md rounded-full bg-[#18181B]/90 backdrop-blur-[25px] shadow-xl border border-[#27272A]/50 p-1.5"
      >
        <div class="relative flex w-full h-full rounded-full items-center overflow-hidden">
          <!-- Sliding background pill -->
          <div
            class="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#27272A] transition-transform duration-300 ease-out"
            style:transform={`translateX(${activeIndex * 100}%)`}
          ></div>

          <a
            href="/"
            class={cn(
              "relative z-10 flex basis-1/3 flex-1 items-center text-[10px] tracking-[0.12px] text-center rounded-full h-full justify-center transition-colors duration-200",
              isDevicesRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isDevicesRoute ? "page" : undefined}
          >
            {#if isDevicesRoute}
              <div
                class="absolute left-0 top-0 z-0 size-full opacity-10 bg-radial from-white to-white/0"
              ></div>
            {/if}
            <div class="relative z-10 size-full flex flex-col gap-0.5 items-center justify-center">
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
              "relative z-10 flex basis-1/3 flex-1 items-center text-[10px] tracking-[0.12px] text-center rounded-full h-full justify-center transition-colors duration-200",
              isActivityRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isActivityRoute ? "page" : undefined}
          >
            {#if isActivityRoute}
              <div
                class="absolute left-0 top-0 z-0 size-full opacity-10 bg-radial from-white to-white/0"
              ></div>
            {/if}
            <div class="relative z-10 size-full flex flex-col gap-0.5 items-center justify-center">
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
              "relative z-10 flex basis-1/3 flex-1 items-center text-[10px] tracking-[0.12px] text-center rounded-full h-full justify-center transition-colors duration-200",
              isSettingsRoute ? "text-white" : "text-[#71717B]"
            )}
            aria-current={isSettingsRoute ? "page" : undefined}
          >
            {#if isSettingsRoute}
              <div
                class="absolute left-0 top-0 z-0 size-full opacity-10 bg-radial from-white to-white/0"
              ></div>
            {/if}
            <div class="relative z-10 size-full flex flex-col gap-0.5 items-center justify-center">
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
