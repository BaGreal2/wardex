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

<div class="relative z-20 flex min-h-dvh flex-col gap-7.5 px-6 pt-10 pb-34">
  <header class="flex flex-col justify-between px-4">
    <h1 class="text-2xl leading-8 font-semibold">Settings</h1>
    <p class="text-sm leading-5 font-light tracking-[-0.15px] text-white/65">
      Manage your account and preferences
    </p>
  </header>

  <div class="flex grow flex-col justify-between">
    <div class="flex flex-col gap-5">
      <div class="rounded-3xl bg-[#171717]/60 backdrop-blur-[25px]">
        <div
          class="absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-5"
        ></div>
        <div class="relative z-10 flex size-full items-center gap-4 p-4">
          <div
            class="flex size-15 items-center justify-center rounded-full border-2 border-[#27272A] bg-transparent"
          >
            <PenIcon class="size-6 text-white/45" />
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <span class="text-lg leading-7 font-medium tracking-[-0.44px]">John Doe</span>
              <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                >{email ?? "unknown"}</span
              >
            </div>

            <div
              class="w-fit rounded-full bg-[#F0B100]/10 px-2 py-0.5 text-xs leading-4 text-[#F0B100]"
            >
              Pro plan
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <span class="text-sm tracking-[-0.15px] text-[#D4D4D4]">General</span>
        <div class="relative rounded-[14px] bg-[#171717]/60 p-1.5 backdrop-blur-[25px]">
          <span
            class="absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-5"
          >
          </span>
          <div class="relative z-10 flex flex-col">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <BellIcon class="size-5 text-[#9F9FA9]" />
                <span class="leading-6 font-light tracking-[-0.31px]">Notifications</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >On</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <GlobeIcon class="size-5 text-[#9F9FA9]" />
                <span class="leading-6 font-light tracking-[-0.31px]">Language</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm leading-5 font-light tracking-[-0.15px] text-[#71717B]"
                  >English</span
                >
                <ChevronRightIcon class="size-4 text-[#52525C]" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <MoonIcon class="size-5 text-[#9F9FA9]" />
                <span class="leading-6 font-light tracking-[-0.31px]">Appearance</span>
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
        <span class="text-sm tracking-[-0.15px] text-[#D4D4D4]">Security</span>
        <div class="relative rounded-[14px] bg-[#171717]/60 p-1.5 backdrop-blur-[25px]">
          <span
            class="absolute top-0 left-0 z-0 size-full bg-radial from-white to-white/0 opacity-5"
          >
          </span>
          <div class="relative z-10 flex flex-col">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <KeyIcon class="size-5 text-[#9F9FA9]" />
                <span class="leading-6 font-light tracking-[-0.31px]">Change Password</span>
              </div>

              <ChevronRightIcon class="size-4 text-[#52525C]" />
            </div>

            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <ShieldInactiveIcon class="size-5 text-[#9F9FA9]" />
                <span class="leading-6 font-light tracking-[-0.31px]"
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
      class="flex w-full items-center justify-center gap-4 py-2 text-sm font-medium tracking-[-0.15px] text-[#FF6467]"
      onclick={logout}
    >
      <LogoutIcon class="size-4" />
      Sign Out
    </button>
  </div>
</div>
