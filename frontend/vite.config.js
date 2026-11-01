import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 개발 서버는 http://localhost:3000 으로 고정한다.
    host: 'localhost',
    port: 3000,
    strictPort: true,
    open: false,
    proxy: {
      // 백엔드(node.js) 준비 후 target 포트만 바꾸면 된다.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  // 테스트 (Vitest) - `npm test`. 브라우저 대신 jsdom 으로 DOM 을 흉내 낸다.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
})
