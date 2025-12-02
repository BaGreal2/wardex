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

<div class="flex justify-between py-8 relative z-20 flex-col min-h-dvh px-6">
  <div
    class="w-full grow basis-3/4 max-h-3/4 top-0 left-0 flex flex-col items-center justify-center gap-2.5"
  >
    <img src="/images/wardex.png" class="w-44 h-[76px]" alt="wardex" />
    <div class="text-center">
      <span class="text-lg leading-[22px] tracking-[-0.44px] text-center text-[#A1A1A1]"
        >Secure Access.</span
      ><br />
      <span class="font-medium text-lg leading-[22px] tracking-[-0.44px] text-center text-white/85"
        >Anywhere.</span
      >
    </div>
  </div>

  <div class="flex flex-col gap-6.5 w-full items-center">
    <div class="flex flex-col gap-2.5 w-full">
      <LinkButton href="/auth/register" class="w-full h-15">Create Account</LinkButton>
      <LinkButton href="/auth/login" variant="secondary" class="w-full h-15">Log In</LinkButton>
    </div>

    <div class="text-xs leading-4 text-[#737373] flex gap-4">
      <a href="/auth">Terms of Service</a>
      <span class="text-base leading-3 text-[#404040] translate-y-0.5 flex">•</span>
      <a href="/auth">Privacy Policy</a>
    </div>
  </div>
</div>
