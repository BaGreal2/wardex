<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils/cn";
  import "./layout.css";

  $: pathname = page.url?.pathname ?? "/";
  $: isAuthRoute = pathname.startsWith("/auth");

  $: isDevicesRoute = pathname === "/" || pathname.startsWith("/devices");
  $: isSettingsRoute = pathname.startsWith("/settings");
</script>

<svelte:head>
  <title>Wardex Guard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
  <!-- Content area -->
  <div class={cn("flex-1 mx-auto w-full max-w-md px-4", isAuthRoute ? "pb-8 pt-10" : "pb-16 pt-4")}>
    <slot />
  </div>

  <!-- Bottom nav (hidden on auth) -->
  {#if !isAuthRoute}
    <nav
      class="fixed inset-x-0 bottom-0 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-md items-center justify-between px-8 py-2 text-[11px]">
        <!-- Devices -->
        <a
          href="/"
          class="flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
          aria-current={isDevicesRoute ? "page" : undefined}
        >
          <div
            class={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
              isDevicesRoute
                ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                : "border-slate-700 bg-slate-900 text-slate-300"
            )}
          >
            🏠
          </div>
          <span class={isDevicesRoute ? "text-emerald-300" : "text-slate-400"}> Devices </span>
        </a>

        <!-- Add -->
        <a
          href="/devices/new"
          class="flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30"
          >
            +
          </div>
          <span class="text-slate-200">Add</span>
        </a>

        <!-- Settings -->
        <a
          href="/settings"
          class="flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
          aria-current={isSettingsRoute ? "page" : undefined}
        >
          <div
            class={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
              isSettingsRoute
                ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                : "border-slate-700 bg-slate-900 text-slate-300"
            )}
          >
            ⚙️
          </div>
          <span class={isSettingsRoute ? "text-emerald-300" : "text-slate-400"}> Settings </span>
        </a>
      </div>
    </nav>
  {/if}
</main>
