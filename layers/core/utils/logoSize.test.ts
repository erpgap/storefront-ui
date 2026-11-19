import { describe, expect, it } from 'vitest'
import { logoHeightEm } from './logoSize'

describe('logoHeightEm', () => {
  it('shows the Alokai wordmark as tall as the text logo\'s capitals', () => {
    // The wordmark is 10386 x 1530; the text logo's capitals are 0.75em tall.
    expect(logoHeightEm(10386 / 1530)).toBeCloseTo(0.75, 2)
  })

  it('gives a squarer logo more height, the component capping it at 1.5em', () => {
    expect(logoHeightEm(1)).toBeGreaterThan(1.5)
    expect(logoHeightEm(0)).toBe(1)
  })
})
