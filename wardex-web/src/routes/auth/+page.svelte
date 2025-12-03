<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import LinkButton from "$lib/components/LinkButton.svelte";
  import { STORAGE_KEY } from "$lib/stores/auth";
  import { onMount } from "svelte";

  onMount(() => {
    if (!browser) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        goto("/");
      }
    } catch {
      // ignore
    }
  });
</script>

<img
  src="/images/bg-gradient-curve.png"
  class="absolute z-0 size-full object-cover md:hidden"
  alt=""
/>

<div class="relative z-20 flex min-h-dvh flex-col justify-between px-6 py-8">
  <div
    class="top-0 left-0 flex max-h-3/4 w-full grow basis-3/4 flex-col items-center justify-center gap-2.5"
  >
    <img src="/images/wardex.png" class="h-[76px] w-44" alt="wardex" />
    <div class="text-center">
      <span class="text-center text-lg leading-[22px] tracking-[-0.44px] text-[#A1A1A1]"
        >Secure Access.</span
      ><br />
      <span class="text-center text-lg leading-[22px] font-medium tracking-[-0.44px] text-white/85"
        >Anywhere.</span
      >
    </div>
  </div>

  <div class="flex w-full flex-col items-center gap-6.5">
    <div class="flex w-full flex-col gap-2.5">
      <LinkButton
        href="/auth/register"
        onclick={(e: any) => {
          e.preventDefault();
          goto("/auth/register");
        }}
        class="h-15 w-full">Create Account</LinkButton
      >
      <LinkButton
        href="/auth/login"
        onclick={(e: any) => {
          e.preventDefault();
          goto("/auth/login");
        }}
        variant="secondary"
        class="h-15 w-full">Log In</LinkButton
      >
    </div>

    <div class="flex gap-4 text-xs leading-4 text-[#737373]">
      <a
        href="/auth"
        onclick={(e) => {
          e.preventDefault();
          goto("/auth");
        }}>Terms of Service</a
      >
      <span class="flex translate-y-0.5 text-base leading-3 text-[#404040]">•</span>
      <a
        href="/auth"
        onclick={(e) => {
          e.preventDefault();
          goto("/auth");
        }}>Privacy Policy</a
      >
    </div>
  </div>
</div>
