<script setup lang="ts">
import { SfButton, SfLink } from "@storefront-ui/vue";

import type { PaymentProvider } from "~/graphql";

const { cart } = useCart();
const router = useRouter();
const { makeGiftCardPayment, loading: discountLoading } = useDiscount();
const { loadPaymentMethods, paymentProviders } = usePayment();

const selectedProvider = ref<PaymentProvider | null>(null);
const isPaymentWithCardReady = ref(false);
const providerPaymentHandler = ref();
const loading = ref(false);
const showPaymentModal = ref(false);
const giftCards = ref(cart.value?.order?.giftCards);

const hasFullPaymentWithGiftCard = computed(() => {
  if (giftCards.value && giftCards.value?.length > 0) {
    return cart.value?.order?.amountTotal === 0;
  }
});

onMounted(async () => {
  await loadPaymentMethods();
  if (paymentProviders.value.length > 0) {
    showPaymentModal.value = true;
    selectedProvider.value = paymentProviders.value[0];
  }
});

const handleGiftCardPayment = async () => {
  await makeGiftCardPayment();
};
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
      {{ $t("placeOrder") }}
    </SfButton>

    <SfButton
      v-else
      size="lg"
      class="w-full mb-4 md:mb-0"
      :disabled="!selectedProvider || !isPaymentWithCardReady || loading"
      @click="providerPaymentHandler"
    >
      {{ $t("placeOrder") }}
    </SfButton>

    <p class="text-sm text-center mt-4 pb-4 md:pb-0">
      <i18n-t keypath="termsInfo" scope="global">
        <template #terms>
          <SfLink
            href="#"
            class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
          >
            {{ $t("termsAndConditions") }}
          </SfLink>
        </template>
        <template #privacyPolicy>
          <SfLink
            href="#"
            class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
          >
            {{ $t("privacyPolicy") }}
          </SfLink>
        </template>
      </i18n-t>
    </p>
    <component
      v-if="
        showPaymentModal &&
        !!selectedProvider?.code &&
        !hasFullPaymentWithGiftCard
      "
      :is="getPaymentProviderComponentName(selectedProvider?.code)"
      :key="selectedProvider?.id"
      :provider="selectedProvider"
      :cart="cart"
      @is-payment-ready="($event: any) => (isPaymentWithCardReady = $event)"
      @provider-payment-handler="
        ($event: any) => (providerPaymentHandler = $event)
      "
      @payment-loading="($event: any) => (loading = $event)"
    />
  </UiOrderSummary>
</template>
