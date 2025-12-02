<script lang="ts">
  import { api } from "$lib/api";
  import { goto } from "$app/navigation";
  import { auth, type AuthUser } from "$lib/stores/auth";
  import ArrowLeft from "$lib/icons/ArrowLeft.svelte";
  import InputField from "$lib/components/InputField.svelte";
  import MailIcon from "$lib/icons/MailIcon.svelte";
  import LockIcon from "$lib/icons/LockIcon.svelte";
  import Button from "$lib/components/Button.svelte";
  import ArrowRight from "$lib/icons/ArrowRight.svelte";

  let email = "";
  let password = "";
  let confirmPassword = "";
  let loading = false;
  let error: string | null = null;
  let acceptedTerms = false;

  type RegisterResponse = {
    token: string;
    user?: {
      id?: string;
      userId?: string;
      email?: string;
    };
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!acceptedTerms) return;

    loading = true;
    error = null;

    try {
      const res = await api.post<RegisterResponse>("/api/auth/register", {
        email,
        password
      });

      const user: AuthUser = {
        email: res.user?.email ?? email,
        userId: res.user?.userId ?? res.user?.id ?? ""
      };

      auth.login(res.token, user);
      goto("/");
    } catch (e) {
      error = e instanceof Error ? e.message : "Registration failed. Try again.";
    } finally {
      loading = false;
    }
  };
</script>

<img
  src="/images/bg-gradient-green.png"
  class="absolute z-0 size-full object-cover md:hidden"
  alt=""
/>

<div class="relative z-10 flex min-h-dvh flex-col gap-5 px-6 pt-12 pb-8">
  <header class="flex w-full items-start justify-between">
    <a href="/auth" class="p-2">
      <ArrowLeft class="size-6 text-[#A1A1A1]" />
    </a>
    <div class="flex flex-col gap-2 text-end">
      <h1 class="text-3xl leading-9 font-semibold tracking-[0.4px]">Create Account</h1>
      <p class="leading-6 font-light tracking-[-0.31px] text-[#A1A1A1]">
        Start your secure journey
      </p>
    </div>
  </header>

  <form class="flex grow flex-col justify-between" on:submit|preventDefault={submit}>
    <div class="flex flex-col gap-4">
      {#if error}
        <div class="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      {/if}

      <InputField
        id="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        bind:value={email}
      >
        <MailIcon slot="icon" class="size-4 text-[#7B7B7B]" />
      </InputField>

      <InputField
        id="password"
        label="Password"
        type="password"
        placeholder="Create password"
        bind:value={password}
      >
        <LockIcon slot="icon" class="size-4 text-[#7B7B7B]" />
      </InputField>

      <InputField
        id="confirm-password"
        label="Confirm password"
        type="password"
        placeholder="Confirm password"
        bind:value={confirmPassword}
      >
        <LockIcon slot="icon" class="size-4 text-[#7B7B7B]" />
      </InputField>

      <label class="mt-1 flex items-center gap-2 text-sm leading-5 font-light text-[#A1A1A1]">
        <input
          type="checkbox"
          bind:checked={acceptedTerms}
          class="h-[18px] w-[18px] appearance-none rounded-full border border-white/30 bg-transparent
         checked:border-white/80 checked:bg-white/80
         focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        <span>
          I agree to the
          <a href="/terms" class="text-white underline underline-offset-2">Terms</a>
          &amp;
          <a href="/privacy" class="text-white underline underline-offset-2">Privacy</a>
        </span>
      </label>
    </div>

    <Button
      type="submit"
      class="h-15 w-full gap-3"
      disabled={confirmPassword !== password ||
        loading ||
        !acceptedTerms ||
        !password ||
        !confirmPassword ||
        !email}
    >
      {#if loading}
        Signing up...
      {:else}
        Sign Up
      {/if}
      <ArrowRight class="size-[18px]" />
    </Button>
  </form>
</div>
