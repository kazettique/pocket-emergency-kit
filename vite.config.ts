import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cmsProxyTarget = (env.CMS_PROXY_TARGET || 'https://api.cms.test.reearth.dev').replace(/\/$/, '')

  return {
  build: {
    // Keep all feature code in the initial bundle so the service worker can
    // precache it on first visit for full offline capability.
    chunkSizeWarningLimit: 2000,
  },
  server: {
    // Proxy same-origin /api/p/* to the Re:Earth CMS public-read API host so
    // the browser sees a same-origin request and doesn't enforce CORS. Client
    // code uses `VITE_CMS_BASE_URL=""` (relative URLs) to make this work.
    proxy: {
      '/api/p': {
        target: cmsProxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cyberjapandata\.gsi\.go\.jp\/xyz\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gsi-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/api\/p\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cms-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 6 },
            },
          },
        ],
      },
      manifest: {
        name: '災害防止アプリ',
        short_name: '防災',
        description: 'Offline disaster prevention guide for Tokyo',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  }
})
