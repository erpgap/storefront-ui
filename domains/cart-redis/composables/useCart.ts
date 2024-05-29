import type {
  Cart,
  CartAddItemResponse,
  CartRemoveItemResponse,
  CartResponse,
  CartUpdateItemResponse,
  MutationCartAddItemArgs,
  MutationCartRemoveItemArgs,
  MutationCartUpdateItemArgs,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { useToast } from "vue-toastification";

export const useCart = () => {
  const { $sdk } = useNuxtApp();
  const toast = useToast();
  const cart = useState<Cart>("cart", () => ({}) as Cart);

  const loading = ref(false);

  const loadCart = async () => {
    console.log(12313);

    loading.value = true;
    const { data } = await useFetch<{ cart: Cart }>(`/api/odoo/cart-load`);
    loading.value = false;

    cart.value = data?.value?.cart || ({} as Cart);
  };

  const cartAdd = async (productId: number, quantity: number) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationCartAddItemArgs,
      CartAddItemResponse
    >({ mutationName: MutationName.CartAddItem }, { productId, quantity });
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartAddItem;

    toast.success("Product has been added to cart");
  };

  const updateItemQuantity = async (lineId: number, quantity: number) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationCartUpdateItemArgs,
      CartUpdateItemResponse
    >(
      { mutationName: MutationName.CartUpdateQuantity },
      { lineId, quantity: Number(quantity) }
    );
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartUpdateItem;
    toast.success("Product updated successfully");
  };

  const removeItemFromCart = async (lineId: number) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationCartRemoveItemArgs,
      CartRemoveItemResponse
    >({ mutationName: MutationName.CartRemoveItem }, { lineId });
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartRemoveItem;
    toast.success("Product removed successfully");
  };

  return {
    loading,
    loadCart,
    cartAdd,
    updateItemQuantity,
    removeItemFromCart,
    cart,
  };
};
