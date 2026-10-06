import { describe, expect, it } from 'vitest'
import { absoluteImageUrl } from './odooImage'

const ODOO = 'https://erp.example.com/'
const ORIGIN = 'https://shop.example.com'

describe('absoluteImageUrl', () => {
  it('sends Odoo image paths to the Odoo host', () => {
    expect(absoluteImageUrl('/web/image/website/1/website_meta_img', ODOO, ORIGIN))
      .toBe('https://erp.example.com/web/image/website/1/website_meta_img')
  })

  it('sends storefront assets to the storefront', () => {
    expect(absoluteImageUrl('/img/home/hero.webp', ODOO, ORIGIN))
      .toBe('https://shop.example.com/img/home/hero.webp')
  })

  it('leaves absolute URLs and empty values alone', () => {
    expect(absoluteImageUrl('https://cdn.example.com/a.jpg', ODOO, ORIGIN))
      .toBe('https://cdn.example.com/a.jpg')
    expect(absoluteImageUrl(null, ODOO, ORIGIN)).toBe('')
  })
})
