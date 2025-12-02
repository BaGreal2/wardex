<script lang="ts">
  import { goto } from "$app/navigation";
  import BellIcon from "$lib/icons/BellIcon.svelte";
  import ChevronRightIcon from "$lib/icons/ChevronRightIcon.svelte";
  import GlobeIcon from "$lib/icons/GlobeIcon.svelte";
  import KeyIcon from "$lib/icons/KeyIcon.svelte";
  import LogoutIcon from "$lib/icons/LogoutIcon.svelte";
  import MoonIcon from "$lib/icons/MoonIcon.svelte";
  import PenIcon from "$lib/icons/PenIcon.svelte";
  import ShieldInactiveIcon from "$lib/icons/ShieldInactiveIcon.svelte";
  import { auth } from "$lib/stores/auth";

  $: email = $auth.user?.email ?? null;

  const logout = () => {
    auth.logout();
    goto("/auth");
  };
</script>

<img
  src="/images/bg-gradient-default.png"
  class="absolute z-0 size-full object-cover md:hidden"
  alt=""
/>

<div class="flex pt-10 pb-24 relative z-20 flex-col min-h-dvh px-6 gap-7.5">
  <header class="flex flex-col justify-between px-4">
    <h1 class="text-2xl leading-8 font-semibold">Settings</h1>
    <p class="text-sm text-white/65 font-light tracking-[-0.15px] leading-5">
      Manage your account and preferences
    </p>
  </header>

  <div class="flex flex-col justify-between grow">
    <div class="flex flex-col gap-5">
      <div class="rounded-3xl backdrop-blur-[25px] bg-[#171717]/60">
        <div
          class="absolute left-0 top-0 z-0 size-full opacity-5 bg-radial from-white to-white/0"
        ></div>
        <div class="relative z-10 flex items-center size-full gap-4 p-4">
          <div
            class="size-15 rounded-full bg-transparent border-2 border-[#27272A] flex justify-center items-center"
          >
            <PenIcon class="size-6 text-white/45" />
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <span class="font-medium tracking-[-0.44px] leading-7 text-lg">John Doe</span>
              <span class="text-[#71717B] text-sm tracking-[-0.15px] leading-5 font-light"
                >{email ?? "unknown"}</span
              >
            </div>

            <div
              class="px-2 py-0.5 rounded-full bg-[#F0B100]/10 text-[#F0B100] text-xs leading-4 w-fit"
            >
              Pro plan
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <span class="text-[#D4D4D4] text-sm tracking-[-0.15px]">General</span>
        <div class="relative bg-[#171717]/60 backdrop-blur-[25px] rounded-[14px] p-1.5">
          <span
            class="absolute left-0 top-0 z-0 size-full opacity-5 bg-radial from-white to-white/0"
          >
          </span>
          <div class="relative z-10 flex flex-col">
            <div class="flex items-center justify-between p-4">
              <div class="flex gap-3 items-center">
                <BellIcon class="size-5 text-[#9F9FA9]" />
                <span class="font-light leading-6 tracking-[-0.31px]">Notifications</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >On</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex gap-3 items-center">
                <GlobeIcon class="size-5 text-[#9F9FA9]" />
                <span class="font-light leading-6 tracking-[-0.31px]">Language</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >English</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex gap-3 items-center">
                <MoonIcon class="size-5 text-[#9F9FA9]" />
                <span class="font-light leading-6 tracking-[-0.31px]">Appearance</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >Dark</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <span class="text-[#D4D4D4] text-sm tracking-[-0.15px]">Security</span>
        <div class="relative bg-[#171717]/60 backdrop-blur-[25px] rounded-[14px] p-1.5">
          <span
            class="absolute left-0 top-0 z-0 size-full opacity-5 bg-radial from-white to-white/0"
          >
          </span>
          <div class="relative z-10 flex flex-col">
            <div class="flex items-center justify-between p-4">
              <div class="flex gap-3 items-center">
                <KeyIcon class="size-5 text-[#9F9FA9]" />
                <span class="font-light leading-6 tracking-[-0.31px]">Change Password</span>
              </div>

              <ChevronRightIcon class="size-4 text-[#52525C]" />
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex gap-3 items-center">
                <ShieldInactiveIcon class="size-5 text-[#9F9FA9]" />
                <span class="font-light leading-6 tracking-[-0.31px]"
                  >Two-Factor Authentication</span
                >
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >Enabled</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      class="w-full text-sm tracking-[-0.15px] flex justify-center items-center gap-4 py-2 text-[#FF6467] font-medium"
      on:click={logout}
    >
      <LogoutIcon class="size-4" />
      Sign Out
    </button>
  </div>
</div>
