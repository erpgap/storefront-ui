import { Cart, CartData, CartResponse, MutationCartAddItemArgs } from '~/graphql';
import { MutationName } from '~/server/mutations';
import { QueryName } from '~/server/queries';
import { useToast } from 'vue-toastification';

export const useCart = () => {
  const cartCounter = useCookie<number>('cart-counter');
  const { $sdk } = useNuxtApp();
  const toast = useToast();
  const cart = useState<Cart>('cart', () => ({} as Cart));

  const loading = ref(false);

  const loadCart = async () => {
    loading.value = true;

    try {
      const { data } = await $sdk().odoo.query<null, CartResponse >({queryName: QueryName.LoadCart});
      cart.value = data.value;
    } finally {
      loading.value = false;
    }
  };

  const cartAdd = async (productId: number, quantity: number) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<MutationCartAddItemArgs, CartResponse >({ mutationName: MutationName.CartAddItem }, { productId, quantity });
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value;
    cartCounter.value = (Number(cartCounter?.value) || 0) + 1;
    toast.success('Product has been added to cart');
  };

  return {
    loading,
    loadCart,
    cartAdd,
    cart
  };
};
