import { describe, expect, it } from 'vitest'
import { storefrontRouteFor } from './cmsReservedRoutes'

const routes = ['/', '/cart', '/cms', '/cms/:id', '/my-account/my-orders/:id']

describe('storefrontRouteFor', () => {
  it('reserves an exact storefront route', () => {
    expect(storefrontRouteFor('/cart', routes)).toBe('/cart')
  })

  it('reserves an address a dynamic route would match', () => {
    expect(storefrontRouteFor('/cms/about', routes)).toBe('/cms/:id')
    expect(storefrontRouteFor('/my-account/my-orders/42', routes))
      .toBe('/my-account/my-orders/:id')
  })

  it('leaves free addresses alone', () => {
    expect(storefrontRouteFor('/about-us', routes)).toBeNull()
    expect(storefrontRouteFor('/cart/summer', routes)).toBeNull()
    expect(storefrontRouteFor('/cmsx', routes)).toBeNull()
  })
})
