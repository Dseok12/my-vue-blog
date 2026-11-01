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
      // 백엔드(backend/) 는 4000 포트에서 실행한다. 포트를 바꾸면 여기만 고치면 된다.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // 업로드한 이미지 파일도 백엔드가 내려 준다.
      '/uploads': {
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
