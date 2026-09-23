import { describe, expect, it } from 'vitest'
import { collectReferences } from './cmsOdooStore'
import type { BlockInstance } from '#shared/cms/blocks'

const block = (data: Record<string, unknown>): BlockInstance =>
  ({ id: 'b1', blockType: 'featuredProducts', data })

describe('collectReferences', () => {
  // These are what make "which live pages feature product X?" answerable, and
  // therefore what makes a product change refresh the right pages instead of
  // waiting for a TTL. Odoo cannot extract them itself - the blocks column is
  // opaque to it - so getting this wrong silently costs the invalidation.

  it('finds product ids', () => {
    expect(collectReferences([block({ productIds: [3, 7] })]).productTmplIds)
      .toEqual([3, 7])
  })

  it('finds category ids', () => {
    expect(collectReferences([block({ categoryIds: [11] })]).categoryIds)
      .toEqual([11])
  })

  it('finds attachment ids inside image urls', () => {
    expect(collectReferences([block({
      image: { en_US: '/web/image/42' },
    })]).attachmentIds).toEqual([42])
  })

  it('looks inside array rows', () => {
    const refs = collectReferences([block({
      items: [
        { image: { en_US: '/web/image/1' } },
        { image: { en_US: '/web/image/2' } },
      ],
    })])
    expect(refs.attachmentIds).toEqual([1, 2])
  })

  it('deduplicates across blocks', () => {
    const refs = collectReferences([
      block({ productIds: [5] }),
      block({ productIds: [5, 6] }),
    ])
    expect(refs.productTmplIds).toEqual([5, 6])
  })

  it('ignores numbers under unrelated keys', () => {
    // pageSize is a count, not a reference.
    expect(collectReferences([block({ pageSize: 4 })]).productTmplIds).toEqual([])
  })

  it('ignores image paths that are not Odoo attachments', () => {
    expect(collectReferences([block({
      image: { en_US: '/img/home/hero.webp' },
    })]).attachmentIds).toEqual([])
  })

  it('uses camelCase keys, as graphene exposes the input type', () => {
    // Graphene camelCases input field names. Sending snake_case silently
    // failed the whole mutation.
    const refs = collectReferences([])
    expect(Object.keys(refs).sort())
      .toEqual(['attachmentIds', 'categoryIds', 'productTmplIds'])
  })

  it('returns empty lists for a page with no blocks', () => {
    expect(collectReferences([])).toEqual({
      productTmplIds: [], categoryIds: [], attachmentIds: [],
    })
  })
})
