import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        moduleResolution: 'Bundler',
        paths: {
          '~/*': ['./app/*'],
          '@/*': ['./app/*'],
          '~~/*': ['./*'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
