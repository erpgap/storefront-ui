import { Cart, CartResponse } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useCart = () => {
  const { $sdk } = useNuxtApp();
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
    try {

      const { data } = await $sdk().odoo.cartAdd(
        { productId, quantity },
        { cartAdd: '123' }
      );

      return {data};
    } catch (err) {
      console.log(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    loadCart,
    cartAdd
  };
};
