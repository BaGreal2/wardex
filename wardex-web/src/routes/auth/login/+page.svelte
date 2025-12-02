<script lang="ts">
  import { api } from "$lib/api";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { auth, STORAGE_KEY, type AuthUser } from "$lib/stores/auth";
  import ArrowLeft from "$lib/icons/ArrowLeft.svelte";
  import MailIcon from "$lib/icons/MailIcon.svelte";
  import InputField from "$lib/components/InputField.svelte";
  import LockIcon from "$lib/icons/LockIcon.svelte";
  import Button from "$lib/components/Button.svelte";
  import ArrowRight from "$lib/icons/ArrowRight.svelte";

  let email = "";
  let password = "";
  let loading = false;
  let error: string | null = null;

  type LoginResponse = {
    token: string;
    user?: {
      id?: string;
      userId?: string;
      email?: string;
    };
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = null;

    try {
      const res = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password
      });

      const user: AuthUser = {
        email,
        userId: ""
      };

      auth.login(res.token, user);
      goto("/");
    } catch (e) {
      error = e instanceof Error ? e.message : "Login failed. Check credentials.";
    } finally {
      loading = false;
    }
  };

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
      <h1 class="text-3xl leading-9 font-semibold tracking-[0.4px]">Welcome Back</h1>
      <p class="leading-6 font-light tracking-[-0.31px] text-[#A1A1A1]">Sign in to continue</p>
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

      <div class="flex flex-col items-end gap-4">
        <InputField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          bind:value={password}
        >
          <LockIcon slot="icon" class="size-4 text-[#7B7B7B]" />
        </InputField>
        <a href="/auth/login" class="text-sm leading-5 font-light text-[#A1A1A1]"
          >Forgot my password</a
        >
      </div>
    </div>

    <Button type="submit" disabled={loading || !password || !email} class="h-15 w-full gap-3">
      {#if loading}
        Signing in...
      {:else}
        Sign in
      {/if}
      <ArrowRight class="size-[18px]" />
    </Button>
  </form>
</div>
