import type {
  Cart,
  CartAddItemResponse,
  CartRemoveItemResponse,
  CartResponse,
  CartUpdateItemResponse,
  MutationCartAddMultipleItemsArgs,
  MutationCartRemoveMultipleItemsArgs,
  MutationCartUpdateMultipleItemsArgs,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";
import { useToast } from "vue-toastification";

export const useCart = () => {
  const { $sdk } = useNuxtApp();
  const cartCounter = useCookie<number>("cart-counter");
  const toast = useToast();
  const cart = useState<Cart>("cart", () => ({}) as Cart);

  const loading = ref(false);

  const loadCart = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<null, CartResponse>({
      queryName: QueryName.LoadCartQuery,
    });
    loading.value = false;

    cart.value = data.value.cart;
    cartCounter.value = Number(data.value.cart.order?.orderLines?.length);
  };

  const cartAdd = async (id: number, quantity: number) => {
    loading.value = true;

    const params: MutationCartAddMultipleItemsArgs = {
      products: [{ id, quantity }],
    };

    const { data, error } = await $sdk().odoo.mutation<
      MutationCartAddMultipleItemsArgs,
      CartAddItemResponse
    >({ mutationName: MutationName.CartAddItem }, params);
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartAddMultipleItems;
    cartCounter.value = Number(cart.value?.order?.orderLines?.length);

    toast.success("Product has been added to cart");
  };

  const updateItemQuantity = async (id: number, quantity: number) => {
    loading.value = true;

    const params: MutationCartUpdateMultipleItemsArgs = {
      lines: [{ id, quantity }],
    };

    const { data, error } = await $sdk().odoo.mutation<
      MutationCartUpdateMultipleItemsArgs,
      CartUpdateItemResponse
    >({ mutationName: MutationName.CartUpdateQuantity }, params);
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartUpdateItem;
    cartCounter.value = Number(cart.value?.order?.orderLines?.length);
    toast.success("Product updated successfully");
  };

  const removeItemFromCart = async (lineId: number) => {
    const params: MutationCartRemoveMultipleItemsArgs = {
      lineIds: [lineId],
    };

    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationCartRemoveMultipleItemsArgs,
      CartRemoveItemResponse
    >({ mutationName: MutationName.CartRemoveItem }, params);
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartRemoveMultipleItems;
    cartCounter.value = Number(cart.value?.order?.orderLines?.length);
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
