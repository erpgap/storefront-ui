import { vi } from 'vitest'

// Mock Nuxt composable useRequestURL
;

(global as any).useRequestURL = vi.fn(() => ({
  href: 'https://example.com/test-path',
}))

// Mock console.warn avoiding tests warnings
global.console.warn = vi.fn()
