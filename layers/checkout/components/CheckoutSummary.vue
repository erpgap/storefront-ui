<script setup lang="ts">
import { SfButton, SfLink } from '@storefront-ui/vue'

import type { PaymentProvider } from '~/graphql'

const { cart, loadCart } = useCart()

watch(cart, (newCart: any) => {
  console.log("Cart updated:", newCart);
}, { deep: true });
const router = useRouter()
const { makeGiftCardPayment, loading: discountLoading } = useDiscount()
const { loadPaymentMethods, paymentProviders } = usePayment()

const { selectedProvider } = usePayment()
const isPaymentWithCardReady = ref(false)
const providerPaymentHandler = ref()
const loading = ref(false)
const showPaymentModal = ref(true)
const giftCards = ref(cart.value?.order?.giftCards)

const hasFullPaymentWithGiftCard = computed(
  () => giftCards.value?.length > 0 && cart.value?.order?.amountTotal === 0,
)

const hasContactInfo = computed(() => !!cart.value?.order?.partner.email)
const hasShippingInfo = computed(
  () => !!cart.value?.order?.partnerShipping?.street,
)

const hasShippingMethod = computed(
  () => !!cart.value?.order?.shippingMethod?.id,
)

onMounted(async () => {
  await loadCart()
  await loadPaymentMethods()
  showPaymentModal.value = true
  selectedProvider.value = paymentProviders.value[0]
  if (paymentProviders.value.length > 0) {
    showPaymentModal.value = true
    selectedProvider.value = paymentProviders.value[0]
  }
})

const handleGiftCardPayment = async () => {
  await makeGiftCardPayment()
}
</script>

<template>
  <UiOrderSummary>
    <SfButton
      v-if="hasFullPaymentWithGiftCard"
      size="lg"
      class="w-full mb-4 md:mb-0"
      :disabled="discountLoading"
      @click.prevent="handleGiftCardPayment"
    >
      {{ $t('placeOrder') }}
    </SfButton>

    <SfButton
      v-else
      size="lg"
      class="w-full mb-4 md:mb-0"
      :disabled="
        !selectedProvider ||
        !isPaymentWithCardReady ||
        loading ||
        !hasContactInfo ||
        !hasShippingInfo ||
        !hasShippingMethod
      "
      @click="providerPaymentHandler"
    >
      {{ $t('placeOrder') }}
    </SfButton>

    <p v-if="!hasContactInfo" class="text-sm text-red-500 text-center mt-2">
      {{ $t('validation.missingContactInfo') }}
    </p>

    <p v-if="!hasShippingInfo" class="text-sm text-red-500 text-center mt-2">
      {{ $t('validation.missingShippingInfo') }}
    </p>

    <p
      v-if="!hasShippingMethod"
      class="text-sm text-red-500 text-center mt-2"
    >
      {{ $t('validation.missingShippingMethod') }}
    </p>

    <p
      v-if="!isPaymentWithCardReady"
      class="text-sm text-red-500 text-center mt-2"
    >
      {{ $t('validation.missingPaymentWithCard') }}
    </p>

    <p v-if="!selectedProvider" class="text-sm text-red-500 text-center mt-2">
      {{ $t('validation.missingProvider') }}
    </p>

    <p v-if="loading" class="text-sm text-red-500 text-center mt-2">
      {{ $t('checkoutPayment.loadingPayment') }}
    </p>

    <p class="text-sm text-center mt-4 pb-4 md:pb-0">
      <i18n-t keypath="termsInfo" scope="global">
        <template #terms>
          <SfLink
            href="#"
            class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
          >
            {{ $t('termsAndConditions') }}
          </SfLink>
        </template>
        <template #privacyPolicy>
          <SfLink
            href="#"
            class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
          >
            {{ $t('privacyPolicy') }}
          </SfLink>
        </template>
      </i18n-t>
    </p>
    <component
      :is="getPaymentProviderComponentName(selectedProvider?.code)"
      v-if="
        showPaymentModal &&
        !!selectedProvider?.code &&
        !hasFullPaymentWithGiftCard
      "
      :key="selectedProvider?.id"
      :provider="selectedProvider"
      :cart="cart"
      :show-payment-modal="showPaymentModal"
      @is-payment-ready="($event: any) => (isPaymentWithCardReady = $event)"
      @provider-payment-handler="
        ($event: any) => (providerPaymentHandler = $event)
      "
      @payment-loading="($event: any) => (loading = $event)"
    />
  </UiOrderSummary>
</template>
