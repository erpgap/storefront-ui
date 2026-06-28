<template>
  <div
    id="stripe-payment-element"
    ref="paymentElementRef"
    class="mt-4"
  />
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
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

// `paymentError` is surfaced by the parent near the Place Order button. We only
// emit it for real failures (form load / transaction / confirmation) — Stripe
// shows field-level validation ("card number incomplete", etc.) inline itself.
const emit = defineEmits([
  'isPaymentReady',
  'providerPaymentHandler',
  'paymentLoading',
  'paymentError',
])

const {
  getStripeInlineFormValues,
  openStripeTransaction,
  inlineFormValues,
} = useStripeDirectPayment(props.provider.id, props.cart?.order?.id)

const paymentElementRef = ref<HTMLElement | null>(null)
const stripe = ref<any>(null)
const elements = ref<any>(null)

onMounted(async () => {
  emit('paymentLoading', true)

  const values = await getStripeInlineFormValues()
  if (!values?.publishable_key) {
    emit('paymentError', 'Unable to load the payment form.')
    emit('paymentLoading', false)
    return
  }

  // NB: don't pass `apiVersion` here — the current Stripe.js build rejects it
  // ("Can not provide apiVersion to Stripe()"). Stripe.js pins its own version.
  stripe.value = await loadStripe(values.publishable_key)
  if (!stripe.value) {
    emit('paymentError', 'Unable to load the payment form.')
    emit('paymentLoading', false)
    return
  }

  // Restrict the form to the methods configured on the Odoo provider — this is
  // the merchant's source of truth, so methods that aren't enabled there (e.g.
  // PayPal) must NOT appear, even if they're active in the Stripe dashboard.
  // But some of those methods are currency-restricted (bancontact/eps/ideal/p24
  // are EUR-only); forcing them on a non-EUR cart makes Stripe refuse to render
  // the whole form ("The currency provided (usd) is invalid..."). So drop the
  // EUR-only methods when the cart isn't in EUR.
  const currency = String(values.currency_name || '').toLowerCase()
  const EUR_ONLY = ['bancontact', 'eps', 'ideal', 'p24', 'giropay', 'sofort']
  const paymentMethodTypes = (values.payment_methods || []).filter(
    (method: string) => currency === 'eur' || !EUR_ONLY.includes(method),
  )

  // Deferred PaymentIntent flow: the amount/currency come from Odoo; the
  // PaymentIntent (and its client secret) is created later, on submit.
  elements.value = stripe.value.elements({
    mode: 'payment',
    amount: Number.parseInt(values.minor_amount, 10),
    currency: values.currency_name,
    captureMethod: values.capture_method,
    ...(paymentMethodTypes.length ? { paymentMethodTypes } : {}),
    appearance: { theme: 'stripe' },
  })

  const paymentElement = elements.value.create('payment', {
    defaultValues: { billingDetails: values.billing_details },
    // `tabs` keeps the form compact (no redundant "Card" accordion header under
    // our own provider selection), and `wallets.link: never` suppresses the
    // inline "fast checkout with Link" email prompt.
    layout: 'tabs',
    wallets: { link: 'never' },
  })
  paymentElement.on('loaderror', (event: any) => {
    emit('paymentError', event?.error?.message || 'Cannot display the payment form.')
  })
  paymentElement.on('change', (event: { complete: boolean }) => {
    emit('isPaymentReady', !!event.complete)
  })
  paymentElement.mount(paymentElementRef.value as HTMLElement)

  emit('paymentLoading', false)
  // The "Place order" button in the summary calls this handler.
  emit('providerPaymentHandler', handlePayment)
})

const handlePayment = async () => {
  if (!stripe.value || !elements.value) return

  emit('paymentError', '')
  emit('paymentLoading', true)

  // 1. Validate the form and collect the payment details. Field-level problems
  //    (incomplete card, etc.) are shown inline by Stripe under each field, so
  //    we don't surface our own message for them — just bring the form into
  //    view so the shopper can see what to fix.
  const { error: submitError } = await elements.value.submit()
  if (submitError) {
    focusPaymentForm()
    emit('paymentLoading', false)
    return
  }

  // 2. Ask Odoo to open the payment; this creates the Stripe PaymentIntent and
  //    returns its one-time client secret and the Odoo return URL.
  const transaction = await openStripeTransaction()
  if (!transaction?.client_secret || !transaction?.return_url) {
    emit('paymentError', 'Could not initialize the payment. Please try again.')
    focusPaymentForm()
    emit('paymentLoading', false)
    return
  }

  // 3. Confirm the payment directly with Stripe. On success Stripe redirects the
  //    browser to the Odoo return URL, which processes the result and redirects
  //    back to the storefront's success or error page. Execution only continues
  //    here when confirmation fails immediately (no redirect happens).
  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    clientSecret: transaction.client_secret,
    confirmParams: { return_url: transaction.return_url },
  })

  emit('paymentError', error?.message || 'Payment failed. Please try again.')
  focusPaymentForm()
  emit('paymentLoading', false)
}

// Scroll the payment form into view so a payment error (Stripe's inline field
// error, or our message) is actually visible — the Place Order button that
// triggered it lives further down in the summary.
const focusPaymentForm = () => {
  paymentElementRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
}

onBeforeUnmount(() => {
  elements.value = null
  stripe.value = null
})
</script>
