import { useToast } from 'vue-toastification'
import type {
  MutationWishlistAddItemArgs,
  MutationWishlistRemoveItemArgs,
  WishlistAddItemResponse,
  WishlistData,
  WishlistRemoveItemResponse,
  WishlistItems,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

export const useWishlist = () => {
  const { $sdk } = useNuxtApp() as any
  const toast = useToast()
  const loading = ref(false)
  const wishlist = useState<WishlistData>('wishlist', () => ({ wishlistItems: [], totalCount: 0 } as unknown as WishlistData))
  const fetchedOnce = useState<boolean>('wishlist-fetched-once', () => false)


  // Load from the Redis-backed endpoint (same pattern as the cart): a refresh
  // reads the persisted wishlist from Redis instead of querying Odoo every time.
  // Odoo is hit at most once per session (on the first cache miss, inside the
  // endpoint); add/remove mutations keep Redis fresh via the manage-wishlist plugin.
  const loadWishlist = async () => {
    try {
      loading.value = true

      const data = await useRequestFetch()<{ wishlist?: WishlistData }>(
        '/api/odoo/wishlist-load',
      )

      wishlist.value = (data?.wishlist as WishlistData)
        || ({ wishlistItems: [] } as unknown as WishlistData)
    }
    catch (error) {
      toast.error(error.data?.message)
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
    }
    catch (error) {
      toast.error(error.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const getProductFromProductId = (productId: number) => {
    return wishlist.value?.wishlistItems?.find(
      (      item: { product: { id: number } }) => item?.product?.id === productId,
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
    }
    catch (error) {
      toast.error(error.data?.message)
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
        (        item: { product: { id: number } }) => item?.product?.id === productId,
      ) || false
    )
  }

  return {
    loading,
    wishlist,
    wishlistTotalItems,
    isInWishlist,
    loadWishlist,
    wishlistAddItem,
    wishlistRemoveItem,
  }
}
