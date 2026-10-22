import { describe, expect, it } from 'vitest'
import { stockForWebsite } from './websiteStock'

describe('stockForWebsite', () => {
  it('reads the website the request belongs to', () => {
    expect(stockForWebsite({ 1: 4, 2: 0 }, 1)).toBe(4)
    expect(stockForWebsite({ 1: 4, 2: 0 }, 2)).toBe(0)
  })

  it('reads website 1 when the website is unknown, as before', () => {
    expect(stockForWebsite({ 1: 78, 2: 12 }, null)).toBe(78)
  })

  it('reads a single-website entry when the website is unknown', () => {
    expect(stockForWebsite({ 3: 7 }, null)).toBe(7)
  })

  it('does not guess between other websites', () => {
    expect(stockForWebsite({ 2: 4, 3: 9 }, null)).toBe(0)
    expect(stockForWebsite({ 1: 4, 2: 9 }, 3)).toBe(0)
  })

  it('treats a missing or malformed entry as no stock', () => {
    expect(stockForWebsite(null, 1)).toBe(0)
    expect(stockForWebsite('{"1": 4}', 1)).toBe(0)
    expect(stockForWebsite({ 1: 'x' }, 1)).toBe(0)
  })
})
