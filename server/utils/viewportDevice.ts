import type { IncomingHttpHeaders } from 'node:http'

/** The request header the device is normalised into. See server/middleware/viewport-device.ts. */
export const VIEWPORT_DEVICE_HEADER = 'x-viewport-device'

export type ViewportDevice = 'mobile' | 'tablet' | 'desktop'

const CLOUDFRONT_DEVICE_HEADERS: Record<string, ViewportDevice> = {
  'cloudfront-is-android-viewer': 'mobile',
  'cloudfront-is-ios-viewer': 'mobile',
  'cloudfront-is-mobile-viewer': 'mobile',
  'cloudfront-is-tablet-viewer': 'tablet',
  'cloudfront-is-desktop-viewer': 'desktop',
}

const DEVICES = new Set<string>(['mobile', 'tablet', 'desktop'])

/**
 * The device class nuxt-viewport would pick for these headers.
 *
 * Mirrors its detectBreakpoint (client hints and CDN headers first, then
 * bowser's platform type, desktop when unsure), which it does not export.
 * Keeping the two in step matters: a request classed differently here would
 * be served a page rendered for another layout.
 */
export async function viewportDevice(headers: IncomingHttpHeaders): Promise<ViewportDevice> {
  const userAgent = String(headers['user-agent'] ?? '')
  if (!userAgent) return 'desktop'

  if (headers['sec-ch-ua-mobile'] === '?1') return 'mobile'
  for (const [header, device] of Object.entries(CLOUDFRONT_DEVICE_HEADERS)) {
    if (headers[header] === 'true') return device
  }
  const cdnDevice = String(headers['cf-device-type'] ?? '')
  if (DEVICES.has(cdnDevice)) return cdnDevice as ViewportDevice

  const { default: Bowser } = await import('bowser')
  const platform = Bowser.getParser(userAgent).getPlatformType()
  return DEVICES.has(platform) ? platform as ViewportDevice : 'desktop'
}
