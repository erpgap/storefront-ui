import { describe, expect, it } from 'vitest'
import { absoluteImageUrl, buildOdooImageUrl } from './odooImage'

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

describe('buildOdooImageUrl', () => {
  it('joins the base with or without a trailing slash', () => {
    const path = '/web/image/product.product/7/image_{width}x{height}'
    const expected = 'https://erp.example.com/web/image/product.product/7/image_10x20'
    expect(buildOdooImageUrl(path, 10, 20, 'https://erp.example.com')).toBe(expected)
    expect(buildOdooImageUrl(path, 10, 20, 'https://erp.example.com/')).toBe(expected)
  })
})
