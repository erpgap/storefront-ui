// tests/components/SomeComponents.nuxt.spec.ts
import { useRecentViewProducts } from '#imports'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'

const { useCookie } = vi.hoisted(() => {
  return {
    useCookie: vi.fn(() => {
      return { value: []}
    })
  }
})

mockNuxtImport('useCookie', () => {
  return useCookie
})

describe('Testing useRecentViewProducts composable', () => {
  it('Creates cookie', async () => {
    useRecentViewProducts()

    expect(useCookie).toHaveBeenCalled()
    expect(useCookie).toHaveBeenCalledWith('recent-view-products')
  })
  it('Add product to cookie list', async () => {
    const { addProductToRecentViews, list } = useRecentViewProducts()

    addProductToRecentViews(100)
    
    expect(list.value).toEqual([100])
  })
  it('Dont add the same ID twice', async () => {
    const { addProductToRecentViews, list } = useRecentViewProducts()

    addProductToRecentViews(100)
    addProductToRecentViews(100)
    
    expect(list.value).toEqual([100])

    addProductToRecentViews(101)

    expect(list.value).toEqual([100, 101])
  })

  it('Remove product from list', async () => {
    const { addProductToRecentViews, list, removeProductFromRecentViews } = useRecentViewProducts()

    addProductToRecentViews(100)
    addProductToRecentViews(101)
    
    removeProductFromRecentViews(101)
    expect(list.value).toEqual([100])

    removeProductFromRecentViews(100)

    /**
     * The computation of the list value is done asynchronously
     * so we need to wait a bit to check the value
     */
    setTimeout(
      () => expect(list.value).toEqual([]),
      10
    )
  })
  it('Dont throw error if we try to remove ID that is not in the list', async () => {
    const { addProductToRecentViews, list, removeProductFromRecentViews } = useRecentViewProducts()

    addProductToRecentViews(100)
    
    removeProductFromRecentViews(222)
    expect(list.value).toEqual([100])
  })

})
