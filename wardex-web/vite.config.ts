import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), Icons({ compiler: 'svelte', })],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: ['wardex-vm.switzerlandnorth.cloudapp.azure.com']
  }
});
