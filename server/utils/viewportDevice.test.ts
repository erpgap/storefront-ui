import { describe, expect, it } from 'vitest'
import { viewportDevice } from './viewportDevice'

const UA = {
  pixel: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
}

describe('viewportDevice', () => {
  it('classes phones, tablets and desktops the way nuxt-viewport does', async () => {
    expect(await viewportDevice({ 'user-agent': UA.pixel })).toBe('mobile')
    expect(await viewportDevice({ 'user-agent': UA.iphone })).toBe('mobile')
    expect(await viewportDevice({ 'user-agent': UA.ipad })).toBe('tablet')
    expect(await viewportDevice({ 'user-agent': UA.linux })).toBe('desktop')
  })

  it('falls back to desktop when it cannot tell', async () => {
    expect(await viewportDevice({})).toBe('desktop')
    expect(await viewportDevice({ 'user-agent': UA.bot })).toBe('desktop')
  })

  it('trusts the mobile client hint and CDN device headers first', async () => {
    expect(await viewportDevice({ 'user-agent': UA.linux, 'sec-ch-ua-mobile': '?1' })).toBe('mobile')
    expect(await viewportDevice({ 'user-agent': UA.linux, 'cloudfront-is-tablet-viewer': 'true' })).toBe('tablet')
    expect(await viewportDevice({ 'user-agent': UA.linux, 'cf-device-type': 'mobile' })).toBe('mobile')
  })
})
