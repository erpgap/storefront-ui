<template>
  <div>
    <div
      id="dropin-container"
      ref="dropinDivElement"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import type { CheckoutAdvancedFlowResponse, CoreConfiguration, Dropin } from '@adyen/adyen-web'
import type { PaymentProvider } from '~~/graphql'

const props = defineProps({
  provider: {
    required: true,
    type: Object as PropType<PaymentProvider>,
  },
  cart: {
    required: true,
    type: Object,
  },
})

const emit = defineEmits([
  'isPaymentReady',
  'providerPaymentHandler',
  'paymentLoading',
])

const adyenDropin = shallowRef<Dropin | null>(null)
const router = useRouter()
const loading = ref(false)

const { getPaymentConfirmation } = usePayment()
const { removeMultipleItemsFromCart } = useCart()

const {
  openAdyenTransaction,
  getAdyenAcquirerInfo,
  getAdyenPaymentMethods,
  paymentMethods,
  acquirerInfo,
  adyenMakeDirectPayment,
  transaction,
  getAdyenPaymentDetails,
} = useAdyenDirectPayment(props.provider.id, props.cart?.order?.id)

/**
 * Settles a payment once Adyen needs nothing more from the shopper: asks Odoo
 * whether the transaction went through, then empties the cart and shows the
 * thank-you page, or the failure page.
 */
async function finishPayment() {
  const data = await getPaymentConfirmation()
  const paymentSuccess
    = data?.order?.lastTransaction?.state === 'Authorized'
      || data?.order?.lastTransaction?.state === 'Confirmed'

  emit('paymentLoading', false)

  if (paymentSuccess) {
    const lineIds = props.cart.order.websiteOrderLine.map((line: { id: any }) => line.id)
    await removeMultipleItemsFromCart(lineIds)
    return navigateTo('/checkout/thank-you')
  }

  return router.push('/checkout/payment-fail')
}

onMounted(async () => {
  loading.value = true

  await openAdyenTransaction()
  await getAdyenAcquirerInfo()
  await getAdyenPaymentMethods()

  const clientKey = acquirerInfo.value?.client_key
  const methods = paymentMethods.value
  if (!clientKey || !methods || Array.isArray(methods) || Object.keys(methods).length === 0) {
    loading.value = false
    return
  }

  await import('@adyen/adyen-web/styles/adyen.css')
  // The auto build registers every payment method, so the drop-in shows
  // whatever Adyen returns for the shop, as 4.x did. Loaded only here.
  const { AdyenCheckout, Dropin } = await import('@adyen/adyen-web/auto')

  /**
   * Hands Odoo's answer (Adyen's own `/payments` or `/payments/details`
   * response) back to the drop-in. With an `action` (3-D Secure, a redirect)
   * the drop-in runs it and calls onAdditionalDetails; otherwise it settles
   * through onPaymentCompleted or onPaymentFailed. No answer at all (the
   * request failed) is a rejection, which also ends in onPaymentFailed.
   */
  const settle = (
    response: Partial<CheckoutAdvancedFlowResponse> | null | undefined,
    actions: { resolve: (r: CheckoutAdvancedFlowResponse) => void, reject: () => void },
  ) => {
    if (!response?.resultCode) {
      actions.reject()
      return
    }
    // The shopper has a step to complete: no spinner over it.
    if (response.action) {
      emit('paymentLoading', false)
    }
    // Only what the drop-in reads: it warns about anything else, such as
    // the pspReference Adyen includes.
    const { resultCode, action, order, donationToken } = response
    actions.resolve({ resultCode, action, order, donationToken })
  }

  const configuration: CoreConfiguration = {
    locale: 'en-US',
    environment: acquirerInfo.value.state === 'test' ? 'test' : 'live',
    clientKey,
    countryCode: methods.country_code,
    paymentMethodsResponse: methods,
    analytics: { enabled: false },

    onSubmit: async (state, _component, actions) => {
      emit('isPaymentReady', false)
      emit('paymentLoading', true)
      try {
        settle(await adyenMakeDirectPayment({
          providerId: props.provider.id,
          transactionReference: transaction.value.reference,
          paymentMethod: state.data.paymentMethod,
          accessToken: transaction.value.access_token,
          browserInfo: state.data.browserInfo || {},
        }), actions)
      }
      catch {
        settle(null, actions)
      }
    },

    // After a 3-D Secure or redirect step.
    onAdditionalDetails: async (state, _component, actions) => {
      emit('paymentLoading', true)
      try {
        settle(await getAdyenPaymentDetails({
          providerId: props.provider.id,
          transactionReference: transaction.value.reference,
          paymentDetails: state.data,
        }), actions)
      }
      catch {
        settle(null, actions)
      }
    },

    // Either way Odoo has the last word on the transaction: finishPayment
    // asks it, as Odoo's own checkout does.
    onPaymentCompleted: () => finishPayment(),
    onPaymentFailed: () => finishPayment(),

    onError: () => {
      emit('paymentLoading', false)
    },

    onChange: (_state, component) => {
      emit('isPaymentReady', !!component.isValid)
    },
  }

  const checkout = await AdyenCheckout(configuration)

  const dropin = new Dropin(checkout, {
    openFirstPaymentMethod: true,
    openFirstStoredPaymentMethod: false,
    showStoredPaymentMethods: false,
    showPaymentMethods: true,
    showPayButton: false,
    onSelect: (component) => {
      emit('isPaymentReady', !!component.isValid)
    },
  }).mount('#dropin-container')
  adyenDropin.value = dropin

  loading.value = false
  // A method: called on its own by the summary's Place Order button.
  emit('providerPaymentHandler', () => dropin.submit())
})

onBeforeUnmount(() => {
  adyenDropin.value?.unmount()
  adyenDropin.value = null
})
</script>
