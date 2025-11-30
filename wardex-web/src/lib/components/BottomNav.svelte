<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const items = [
    {
      label: 'Devices',
      href: '/devices',
      icon: '▢', // simple icon; can be replaced with SVG if you want
    },
    {
      label: 'Account',
      href: '/account',
      icon: '◎',
    }
  ];

  $: pathname = $page.url.pathname;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const navigate = (href: string) => {
    if (href === pathname) return;
    goto(href);
  };
</script>

<nav
  class="border-t border-slate-800 bg-slate-950/90 backdrop-blur
         px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]
         flex items-center justify-around text-[11px]"
>
  {#each items as item}
    <button
      type="button"
      class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5
             rounded-full transition-all duration-150
             {isActive(item.href)
               ? 'text-emerald-300 bg-slate-800/80 shadow-inner shadow-emerald-500/10'
               : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}"
      on:click={() => navigate(item.href)}
      aria-current={isActive(item.href) ? 'page' : undefined}
    >
      <span class="text-xs leading-none">{item.icon}</span>
      <span class="uppercase tracking-[0.12em] font-medium">
        {item.label}
      </span>
    </button>
  {/each}
</nav>
