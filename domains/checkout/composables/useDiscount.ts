import { useToast } from "vue-toastification";
import type {
  ApplyDiscountsResponse,
  MakeGiftCardPaymentResponse,
  MutationApplyCouponArgs,
  MutationApplyGiftCardArgs,
} from "~/graphql";
import { MutationName } from "~/server/mutations";

export const useDiscount = () => {
  const { $sdk } = useNuxtApp();
  const toast = useToast();
  const router = useRouter();
  const { loadCart } = useCart();

  const loading = ref(false);

  const applyGiftCard = async (promo: MutationApplyGiftCardArgs) => {
    return $sdk().odoo.mutation<
      MutationApplyGiftCardArgs,
      ApplyDiscountsResponse
    >({ mutationName: MutationName.ApplyGiftCardMutation }, promo);
  };

  const applyCoupon = async (promo: MutationApplyCouponArgs) => {
    return $sdk().odoo.mutation<
      MutationApplyCouponArgs,
      ApplyDiscountsResponse
    >({ mutationName: MutationName.ApplyCouponMutation }, promo);
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

    await loadCart(false);
    toast.success("Promotion has been applied!");
  };

  const makeGiftCardPayment = async () => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      null,
      MakeGiftCardPaymentResponse
    >({ mutationName: MutationName.MakeGiftCardPaymentMutation });

    loading.value = false;

    if (error.value) {
      toast.error(error.value.data.message);
      return;
    }

    if (!data.value.makeGiftCardPayment.done) {
      router.push("/payment-fail");
      return;
    }

    router.push("/thank-you");
  };

  return {
    loading,
    applyDiscount,
    makeGiftCardPayment,
  };
};
