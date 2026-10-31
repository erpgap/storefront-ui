import { useToast } from 'vue-toastification'
import { useCheckout } from './useCheckout'
import type {
  ApplyDiscountsResponse,
  MakeGiftCardPaymentResponse,
  MutationApplyCouponArgs,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

export const useDiscount = () => {
  const { $sdk, $i18n } = useNuxtApp()
  const { loading, setLoading } = useCheckout()
  const toast = useToast()
  // The code box's own state. `loading` is shared by all of checkout (Place
  // order waits on it), and the box read "Applying…" whenever checkout loaded
  // anything else, such as the delivery methods.
  const applying = useState('discount-applying', () => false)

  // One box takes both promo codes and gift cards: Odoo's applyCoupon tries
  // the code against every loyalty program, gift cards included. A code it
  // cannot use is not an error to GraphQL; the reason comes back in `error`.
  // Resolves to whether the code was applied.
  const applyDiscount = async (promoCode: string): Promise<boolean> => {
    try {
      applying.value = true
      setLoading(true)

      const data = await $sdk().odoo.mutation<
        MutationApplyCouponArgs,
        Pick<ApplyDiscountsResponse, 'applyCoupon'>
      >({ mutationName: MutationName.ApplyCouponMutation }, { promo: promoCode })

      const refused = data?.applyCoupon?.error
      if (refused) {
        toast.error(refused)
        return false
      }
      toast.success($i18n.t('checkoutPayment.codeApplied'))
      return true
    }
    catch (error: any) {
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
      return false
    }
    finally {
      applying.value = false
      setLoading(false)
    }
  }

  const makeGiftCardPayment = async () => {
    try {
      setLoading(true)

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
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
    }
    finally {
      setLoading(false)
    }
  }

  return {
    loading,
    applying,
    applyDiscount,
    makeGiftCardPayment,
  }
}
