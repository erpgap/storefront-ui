import { useToast } from 'vue-toastification'
import type {
  ApplyDiscountsResponse,
  MakeGiftCardPaymentResponse,
  MutationApplyCouponArgs,
  MutationApplyGiftCardArgs,
} from '~/graphql'
import { MutationName } from '~/server/mutations'

export const useDiscount = () => {
  const { $sdk } = useNuxtApp()
  const toast = useToast()

  const loading = ref(false)

  const applyGiftCard: ApplyDiscountsResponse | any = async (promo: MutationApplyGiftCardArgs) => {
    return $sdk().odoo.mutation<
      MutationApplyGiftCardArgs,
      ApplyDiscountsResponse
    >({ mutationName: MutationName.ApplyGiftCardMutation }, promo)
  }

  const applyCoupon: ApplyDiscountsResponse | any = async (promo: MutationApplyCouponArgs) => {
    return $sdk().odoo.mutation<
      MutationApplyCouponArgs,
      ApplyDiscountsResponse
    >({ mutationName: MutationName.ApplyCouponMutation }, promo)
  }

  const applyDiscount = async (promoCode: string) => {
    try {
      loading.value = true

      let response = await applyCoupon({ promo: promoCode })
      if (!response?.applyCoupon) {
        response = await applyGiftCard({ promo: promoCode })
      }

      toast.success('Promotion has been applied!')
    }
    finally {
      loading.value = false
    }
  }

  const makeGiftCardPayment = async () => {
    try {
      loading.value = true

      const data: MakeGiftCardPaymentResponse | any = await $sdk().odoo.mutation<
        null,
        MakeGiftCardPaymentResponse
      >({ mutationName: MutationName.MakeGiftCardPaymentMutation })

      if (!data?.makeGiftCardPayment?.done) {
        return navigateTo('/checkout/payment-fail')
      }

      return navigateTo('/checkout/thank-you')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    applyDiscount,
    makeGiftCardPayment,
  }
}
