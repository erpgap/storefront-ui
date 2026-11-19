import type {
  MutationWishlistAddItemArgs,
  MutationWishlistRemoveItemArgs,
  WishlistAddItemResponse,
  WishlistData,
  WishlistRemoveItemResponse,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

export const useWishlist = () => {
  const { $sdk, $i18n } = useNuxtApp()
  // Taken here, while the composable runs in the component's setup: the
  // functions below run later, when Nuxt's context may be gone (during SSR
  // that threw NUXT_E1001 and lost the request's cookies).
  const requestFetch = useRequestFetch()
  const loading = ref(false)
  const wishlist = useState<WishlistData>('wishlist', () => ({ wishlistItems: [], totalCount: 0 } as unknown as WishlistData))
  const fetchedOnce = useState<boolean>('wishlist-fetched-once', () => false)
  // Loading failed: the wishlist page says so; elsewhere (the header count)
  // it stays quiet.
  const loadError = useState('wishlist-load-error', () => '')
  // Why adding or removing a product failed, by product id: shown next to
  // the heart that did it, on its card, its page or the side wishlist.
  const itemErrors = useState<Record<number, string>>('wishlist-item-errors', () => ({}))
  const setItemError = (productId: number, message = '') => {
    const { [productId]: _previous, ...others } = itemErrors.value
    itemErrors.value = message ? { ...others, [productId]: message } : others
  }

  // Load from the Redis-backed endpoint (same pattern as the cart): a refresh
  // reads the persisted wishlist from Redis instead of querying Odoo every time.
  // Odoo is hit at most once per session (on the first cache miss, inside the
  // endpoint); add/remove mutations keep Redis fresh via the manage-wishlist plugin.
  const loadWishlist = async () => {
    try {
      loading.value = true

      const data = await requestFetch<{ wishlist?: WishlistData }>(
        '/api/odoo/wishlist-load',
      )

      wishlist.value = (data?.wishlist as WishlistData)
        || ({ wishlistItems: [] } as unknown as WishlistData)
      loadError.value = ''
    }
    catch (error) {
      loadError.value = errorMessage(error, $i18n.t('core.genericError'))
    }
    finally {
      loading.value = false
    }
  }

  const wishlistAddItem = async (productId: number) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.mutation<
        MutationWishlistAddItemArgs,
        WishlistAddItemResponse
      >({ mutationName: MutationName.WishlistAddItem }, { productId })

      wishlist.value = data?.wishlistAddItem
      setItemError(productId)
    }
    catch (error) {
      setItemError(productId, errorMessage(error, $i18n.t('core.genericError')))
    }
    finally {
      loading.value = false
    }
  }

  const getProductFromProductId = (productId: number) => {
    return wishlist.value?.wishlistItems?.find(
      item => item?.product?.id === productId,
    )
  }

  const wishlistRemoveItem = async (productId: number) => {
    const wishlistItem = getProductFromProductId(productId)

    if (!wishlistItem) {
      return
    }

    try {
      loading.value = true
      const data = await $sdk().odoo.mutation<
        MutationWishlistRemoveItemArgs,
        WishlistRemoveItemResponse
      >(
        { mutationName: MutationName.WishlistRemoveItem },
        { wishId: wishlistItem.id },
      )

      wishlist.value = data?.wishlistRemoveItem
      setItemError(productId)
    }
    catch (error) {
      setItemError(productId, errorMessage(error, $i18n.t('core.genericError')))
    }
    finally {
      loading.value = false
    }
  }

  const wishlistTotalItems = computed(() => {
    return wishlist.value?.wishlistItems?.length || 0
  })

  const isInWishlist = (productId: number) => {
    return (
      wishlist.value?.wishlistItems?.some(
        item => item?.product?.id === productId,
      ) || false
    )
  }

  return {
    loading,
    loadError,
    itemErrors,
    wishlist,
    wishlistTotalItems,
    isInWishlist,
    loadWishlist,
    wishlistAddItem,
    wishlistRemoveItem,
  }
}
