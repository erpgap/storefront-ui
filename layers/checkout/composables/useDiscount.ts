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
  // The code box's own state. `loading` is shared by all of checkout (Place
  // order waits on it), and the box read "Applying…" whenever checkout loaded
  // anything else, such as the delivery methods.
  const applying = useState('discount-applying', () => false)

  // One box takes both promo codes and gift cards: Odoo's applyCoupon tries
  // the code against every loyalty program, gift cards included. A code it
  // cannot use is not an error to GraphQL; the reason comes back in `error`.
  // Resolves to why the code was not applied, or null when it was: the box
  // shows that under the field, not in a toast.
  const applyDiscount = async (promoCode: string): Promise<string | null> => {
    try {
      applying.value = true
      setLoading(true)

      const data = await $sdk().odoo.mutation<
        MutationApplyCouponArgs,
        ApplyDiscountsResponse
      >({ mutationName: MutationName.ApplyCouponMutation }, { promo: promoCode })

      return data?.applyCoupon?.error || null
    }
    catch (error: any) {
      return errorMessage(error, $i18n.t('core.genericError'))
    }
    finally {
      applying.value = false
      setLoading(false)
    }
  }

  // Resolves to why the payment could not be made, for Place order to show
  // under itself, or null once on the way to the thank-you (or failure) page.
  const makeGiftCardPayment = async (): Promise<string | null> => {
    try {
      setLoading(true)

      const data: MakeGiftCardPaymentResponse | any = await $sdk().odoo.mutation<
        null,
        MakeGiftCardPaymentResponse
      >({ mutationName: MutationName.MakeGiftCardPaymentMutation })

      await navigateTo(data?.makeGiftCardPayment?.done ? '/checkout/thank-you' : '/checkout/payment-fail')
      return null
    }
    catch (error: any) {
      return errorMessage(error, $i18n.t('core.genericError'))
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
