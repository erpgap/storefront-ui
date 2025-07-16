import { vi } from 'vitest'

// Mock Nuxt composable useRequestURL
;

(global as any).useRequestURL = vi.fn(() => ({
  href: 'https://example.com/test-path',
}))

// Mock do console.warn para evitar warnings nos testes
global.console.warn = vi.fn()
