/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { WishlistItems, WishlistResponse } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useWishlist = () => {
  const { $sdk } = useNuxtApp();
  const loading = ref(false);

  const currentWishlist = ref<any>({});

  const loadWishlist = async () => {
    loading.value = true;
    try {
      const {data} = await useAsyncData('wishlist', async () => {
        const { data } = await $sdk().odoo.query<any, WishlistResponse>({queryName: QueryName.GetWishlist });
        return data.value;
      });

      if (data?.value)
        currentWishlist.value = data?.value;
    } catch (err) {
      console.log(err);
    } finally {
      loading.value = false;
    }
  };

  const WishlistAddItem = async (id: number) => {
    try {
      loading.value = true;
      const { data }: any = await sdk.odoo.wishlistAdd(
        { productId: id },
        { wishlistAdd: 'customQuery' }
      );
      currentWishlist.value = data.wishlistItems;
      return data.wishlistAddItem;
    } catch (err) {
      console.log(err);
    } finally {
      loading.value = false;
    }
  };

  const WishlistRemoveItem = async (id: number) => {
    try {
      const removeItemParams: any = {
        wishId: id,
      };
      const { data }: any = await $sdk.odoo.wishlistRemove(removeItemParams, {
        wishlistRemove: 'customQuery',
      });
      return data.wishlistRemoveItem;
    } catch (err) {
      console.log(err);
    }
  };

  // const isInWishlist = async (id: number) => {
  //   return currentWishlist.value?.wishlistItems.some(
  //     (item: { product: { id: number } }) => item.product.id === id
  //   );
  // };

  return {
    loading,
    loadWishlist,
    wishlistItems: computed(() => currentWishlist.value?.wishlistItems),
    // isInWishlist,
    WishlistAddItem,
    WishlistRemoveItem,
  };
};
