import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // Playwright owns test/e2e. Vitest picking those up means it tries to
    // run browser specs in node, which fails in a way that looks like the
    // unit suite is broken.
    exclude: ['**/node_modules/**', '**/dist/**', 'test/e2e/**'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      // Layer aliases, set by each layer's nuxt.config, which vitest does not load.
      '#cms-blocks': fileURLToPath(new URL('./layers/cms-blocks', import.meta.url)),
      '#cms': fileURLToPath(new URL('./layers/cms', import.meta.url)),
    },
  },
})
