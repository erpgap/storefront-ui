import viewportOptions from '#viewport-options'

/**
 * Hands nuxt-viewport the device class when the user-agent is not there.
 *
 * A page rendered for an SWR cache entry sees only the headers the route rule
 * varies on, so nuxt-viewport finds no user-agent and falls back to desktop.
 * The `x-viewport-device` header (server/middleware/viewport-device.ts) is
 * among those headers and says which layout this copy is for; it is mapped
 * to a breakpoint the way nuxt-viewport maps a detected device.
 *
 * Runs after nuxt-viewport's own plugin (module plugins register before the
 * app's), so it only corrects the fallback; with a user-agent present
 * nuxt-viewport has already decided and this does nothing.
 */
export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(['user-agent', 'x-viewport-device'])
  const device = headers['x-viewport-device']
  if (headers['user-agent'] || !device) return

  const { defaultBreakpoints, breakpoints } = viewportOptions as {
    defaultBreakpoints: Record<string, string>
    breakpoints: Record<string, number>
  }
  const breakpoint = defaultBreakpoints[device]
  if (breakpoint && breakpoint in breakpoints) {
    useState<string>('viewportState').value = breakpoint
  }
})
