import { describe, expect, it } from 'vitest'
import { productCacheRules } from './productCacheRules'

describe('productCacheRules', () => {
  it('caches every product page with one rule when all share the prefix', () => {
    expect(productCacheRules(['/product/wool-coat-341', '/product/loafers-154']))
      .toEqual({ paths: ['/product/**'], mixed: false })
  })

  it('keeps the rule when the build saw no products, for those added later', () => {
    expect(productCacheRules([])).toEqual({ paths: ['/product/**'], mixed: false })
  })

  it('goes back to one rule per product when any URL lacks the prefix', () => {
    const slugs = ['/product/wool-coat-341', '/shop/loafers-154']
    expect(productCacheRules(slugs)).toEqual({ paths: slugs, mixed: true })
  })

  it('does not take a lookalike prefix for the real one', () => {
    expect(productCacheRules(['/products-sale-1']).mixed).toBe(true)
  })
})
