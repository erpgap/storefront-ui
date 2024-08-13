import { useToast } from 'vue-toastification';
import type {
  ApplyGiftCardResponse,
  MutationApplyCouponArgs,
  MutationApplyGiftCardArgs,
} from '~/graphql';
import { MutationName } from '~/server/mutations';

export const useDiscount = () => {
  const { $sdk } = useNuxtApp();
  const toast = useToast();
  const { loadCart } = useCart();

  const loading = ref(false);

  const applyGiftCard = async (promo: MutationApplyGiftCardArgs) => {
    return $sdk().odoo.mutation<
      MutationApplyGiftCardArgs,
      ApplyGiftCardResponse
    >({ mutationName: MutationName.ApplyGiftCardMutation }, promo);
  };

  const applyCoupon = async (promo: MutationApplyCouponArgs) => {
    return $sdk().odoo.mutation<MutationApplyCouponArgs, ApplyGiftCardResponse>(
      { mutationName: MutationName.ApplyCouponMutation },
      promo
    );
  };

  const applyDiscount = async (promoCode: string) => {
    loading.value = true;

    let response = await applyGiftCard({ promo: promoCode });
    if (response.error.value) {
      response = await applyCoupon({ promo: promoCode });
    }

    loading.value = false;

    if (response.error.value) {
      return toast.error(response.error.value.data.message);
    }

    await loadCart(true);
    toast.success('Promotion has been applied!');
  };

  return {
    loading,
    applyDiscount,
  };
};
