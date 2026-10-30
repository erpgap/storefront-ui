import { describe, expect, it } from 'vitest'
import { hitProductId, isAlgoliaConfigured, sortByIds } from './useAlgolia'

const full = { enabled: '1', applicationId: 'APP', searchApiKey: 'key', indexName: 'products' }

describe('isAlgoliaConfigured', () => {
  it('needs it turned on and every value a query uses', () => {
    expect(isAlgoliaConfigured(full)).toBe(true)
    expect(isAlgoliaConfigured({ ...full, enabled: '' })).toBe(false)
    // The environment is parsed: =1 arrives as a number, =true as a boolean.
    expect(isAlgoliaConfigured({ ...full, enabled: 1 })).toBe(true)
    expect(isAlgoliaConfigured({ ...full, enabled: true })).toBe(true)
    expect(isAlgoliaConfigured({ ...full, enabled: 'true' })).toBe(true)
    expect(isAlgoliaConfigured({ ...full, enabled: 0 })).toBe(false)
    expect(isAlgoliaConfigured({ ...full, enabled: '0' })).toBe(false)
    expect(isAlgoliaConfigured({ ...full, applicationId: '' })).toBe(false)
    expect(isAlgoliaConfigured({ ...full, searchApiKey: '' })).toBe(false)
    expect(isAlgoliaConfigured({ ...full, indexName: '' })).toBe(false)
    expect(isAlgoliaConfigured(undefined)).toBe(false)
  })
})

describe('hitProductId', () => {
  it('reads the Odoo id from `id`, then from the objectID', () => {
    expect(hitProductId({ objectID: 'abc', id: 210 })).toBe(210)
    expect(hitProductId({ objectID: 'abc', id: '210' })).toBe(210)
    expect(hitProductId({ objectID: '47' })).toBe(47)
  })

  it('skips records that do not name a product', () => {
    expect(hitProductId({ objectID: 'product-47' })).toBeNull()
    expect(hitProductId({ objectID: '0' })).toBeNull()
  })
})

describe('sortByIds', () => {
  it('puts items in the order of the ids, unknown ones last', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 9 }]
    expect(sortByIds(items, [3, 1, 2]).map(item => item.id)).toEqual([3, 1, 2, 9])
  })
})
