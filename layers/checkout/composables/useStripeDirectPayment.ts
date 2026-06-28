import { MutationName } from '~~/server/mutations'

/**
 * Stripe direct-payment composable. Mirrors useAdyenDirectPayment: it talks to
 * Odoo (never to Stripe) to (1) fetch the values needed to render the Stripe
 * payment widget and (2) open an Odoo payment that returns the one-time client
 * secret used to confirm the payment with Stripe in the browser.
 */
const useStripeDirectPayment = (providerId: number, cartId?: number) => {
  const { $sdk } = useNuxtApp()

  const inlineFormValues = useState<Record<string, any>>(
    `stripe-inline-${cartId}`,
    () => ({}),
  )
  const transaction = useState<Record<string, any>>(
    `stripe-transaction-${cartId}`,
    () => ({}),
  )

  const getStripeInlineFormValues = async () => {
    const data: any = await $sdk().odoo.mutation(
      { mutationName: MutationName.StripeGetInlineFormValues },
      { providerId },
    )
    inlineFormValues.value
      = data?.stripeGetInlineFormValues?.stripeGetInlineFormValues || {}
    return inlineFormValues.value
  }

  const openStripeTransaction = async (tokenizationRequested = false) => {
    const data: any = await $sdk().odoo.mutation(
      { mutationName: MutationName.StripeTransaction },
      { providerId, tokenizationRequested },
    )
    transaction.value = data?.stripeTransaction?.transaction || {}
    return transaction.value
  }

  return {
    inlineFormValues,
    transaction,
    getStripeInlineFormValues,
    openStripeTransaction,
  }
}

export default useStripeDirectPayment
