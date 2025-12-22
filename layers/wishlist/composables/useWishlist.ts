import { useToast } from 'vue-toastification'
import type {
  MutationWishlistAddItemArgs,
  MutationWishlistRemoveItemArgs,
  WishlistAddItemResponse,
  WishlistData,
  WishlistLoadResponse,
  WishlistRemoveItemResponse,
  WishlistItems,
} from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

export const useWishlist = () => {
  const { $sdk } = useNuxtApp() as any
  const toast = useToast()
  const loading = ref(false)
  const wishlist = useState<WishlistData>('wishlist', () => ({ wishlistItems: [], totalCount: 0 } as unknown as WishlistData))
  const fetchedOnce = useState<boolean>('wishlist-fetched-once', () => false)

  let inflight: Promise<void> | null = null

  const loadWishlist = async (): Promise<void> => {

    loading.value = true

    inflight = $sdk().odoo
      .query({ queryName: QueryName.WishlistLoadQuery })
      .then((raw: unknown) => {
        const data = raw as WishlistLoadResponse
        const safe: WishlistItems = data?.wishlistItems ?? { totalCount: 0, wishlistItems: [] }
        wishlist.value = safe
        fetchedOnce.value = true
      })
      .catch((err: any) => {
        toast.error(err?.data?.message ?? 'Falha ao carregar a wishlist.')
      })
      .finally(() => {
        loading.value = false
        inflight = null
      })

    await inflight
  }

  const wishlistAddItem = async (productId: number) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.mutation(
        { mutationName: MutationName.WishlistAddItem },
        { productId },
      ) as WishlistAddItemResponse

      wishlist.value = data?.wishlistAddItem ?? wishlist.value
    }
    catch (error: any) {
      toast.error(error?.data?.message ?? 'Não foi possível adicionar à wishlist.')
    }
    finally {
      loading.value = false
    }
  }

  const getProductFromProductId = (productId: number) =>
    wishlist.value?.wishlistItems?.find((item: any) => item?.product?.id === productId)

  const wishlistRemoveItem = async (productId: number) => {
    const wishlistItem = getProductFromProductId(productId)
    if (!wishlistItem) return

    try {
      loading.value = true
      const data = await $sdk().odoo.mutation(
        { mutationName: MutationName.WishlistAddItem },
        { productId },
      ) as WishlistAddItemResponse

      wishlist.value = data?.wishlistAddItem ?? wishlist.value
    }
    catch (error: any) {
      toast.error(error?.data?.message ?? 'Não foi possível remover da wishlist.')
    }
    finally {
      loading.value = false
    }
  }

  const wishlistTotalItems = computed(() => {
    return wishlist.value?.wishlistItems?.length || 0
  })

  const isInWishlist = (productId: number) =>
    wishlist.value?.wishlistItems?.some((i: any) => i?.product?.id === productId) || false

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
