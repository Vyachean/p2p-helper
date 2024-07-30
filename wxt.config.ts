import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['activeTab', 'scripting', 'webRequest'],
    host_permissions: ['*://*.bybit.com/*'],
  },
});
