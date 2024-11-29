import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue()],
  optimizeDeps: {
    disabled: true,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    include: ['**/test/*.{js,tsx,ts}'],
    alias: {
      '@root': './src',
    },
    setupFiles: [resolve(__dirname, 'test/setup/setup.ts')],
    globals: true,
  },
})
