<template>
  <div>
    <div id="dropin-container" ref="dropinDivElement" class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import type { PaymentProvider } from '~/graphql'

interface AdyenDropinType {
  handleAction: (action: any) => void
  unmount: () => void
  mount: (selector: string) => void
  submit: () => void
}

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

const adyenDropin = ref<AdyenDropinType | null>(null)
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

function ensureAdyenCssLoaded() {
  const id = 'adyen-css'
  if (document.getElementById(id)) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  // este caminho funciona quando o pacote está instalado; Vite serve em dev e resolve em build
  link.href = '/_nuxt/node_modules/@adyen/adyen-web/dist/adyen.css'
  // em prod o path pode mudar; alternativa melhor abaixo
  document.head.appendChild(link)
}

onMounted(async () => {
  loading.value = true

  await openAdyenTransaction()
  await getAdyenAcquirerInfo()
  await getAdyenPaymentMethods()

  if (!acquirerInfo.value?.client_key) {
    loading.value = false
    return
  }

  if (!paymentMethods.value || Object.keys(paymentMethods.value).length === 0) {
    loading.value = false
    return
  }

  await import('@adyen/adyen-web/dist/adyen.css')
  const { default: AdyenCheckout } = await import('@adyen/adyen-web')

  const configuration = {
    locale: 'en-EN',
    environment: acquirerInfo.value.state === 'test' ? 'test' : 'live',
    clientKey: acquirerInfo.value.client_key,
    paymentMethodsResponse: paymentMethods.value,
    analytics: { enabled: false },

    onPaymentCompleted: () => router.push({ name: 'paymentResponse' }),

    onError: (error: any) => {
      if (
        error?.errorText !== 'error was cleared' &&
        error?.errorText !== 'incomplete field'
      ) {
        // log / toast se quiser
      }
      emit('paymentLoading', false)
    },

    onAdditionalDetails: async (state: any) => {
      await getAdyenPaymentDetails({
        providerId: props.provider.id,
        transactionReference: transaction.value.reference,
        paymentDetails: state.data,
      })
    },

    onChange: (_state: any, component: { isValid: boolean }) => {
      emit('isPaymentReady', !!component.isValid)
    },

    onSubmit: async (state: any) => {
      emit('isPaymentReady', false)
      emit('paymentLoading', true)

      const response = await adyenMakeDirectPayment({
        providerId: props.provider.id,
        transactionReference: transaction.value.reference,
        paymentMethod: state.data.paymentMethod,
        accessToken: transaction.value.access_token,
        browserInfo: state.data?.browserInfo || {},
      })

      if (response?.action?.type) {
        adyenDropin.value?.handleAction(response.action)
        emit('paymentLoading', false)
        return
      }

      const data = await getPaymentConfirmation()
      const paymentSuccess =
        data?.order?.lastTransaction?.state === 'Authorized' ||
        data?.order?.lastTransaction?.state === 'Confirmed'

      emit('paymentLoading', false)

      if (paymentSuccess) {
        const lineIds = props.cart.order.websiteOrderLine.map((line: { id: any }) => line.id)
        await removeMultipleItemsFromCart(lineIds)
        return navigateTo('/checkout/thank-you')
      }

      router.push('/checkout/payment-fail')
    },
  }

  const checkout = new AdyenCheckout(configuration)

  adyenDropin.value = checkout
    .create('dropin', {
      openFirstPaymentMethod: true,
      openFirstStoredPaymentMethod: false,
      showStoredPaymentMethods: false,
      showPaymentMethods: true,
      showPayButton: false,
      setStatusAutomatically: true,
      onSelect: (component: { isValid: boolean }) => {
        emit('isPaymentReady', !!component.isValid)
      },
    })
    .mount('#dropin-container')

  loading.value = false
  emit('providerPaymentHandler', adyenDropin.value.submit)
})

onBeforeUnmount(() => {
  adyenDropin.value?.unmount()
  adyenDropin.value = null
})
</script>
