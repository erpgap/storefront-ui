<template>
  <div>
    <div id="dropin-container" ref="dropinDivElement" class="mt-4" />
  </div>
</template>

<script lang="ts" setup>
import AdyenCheckout from "@adyen/adyen-web";
import "@adyen/adyen-web/dist/adyen.css";
import type { PaymentProvider } from "~/graphql";

interface AdyenDropinType {
  handleAction: (action: any) => void;
  unmount: () => void;
  mount: (selector: string) => void;
  submit: () => void;
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
});
const emit = defineEmits([
  "isPaymentReady",
  "providerPaymentHandler",
  "paymentLoading",
]);
const adyenDropin = ref<AdyenDropinType | null>(null);
const router = useRouter();
const dropinDivElement = ref(null);
const loading = ref(false);
const { getPaymentConfirmation } = usePayment();

const {
  openAdyenTransaction,
  getAdyenAcquirerInfo,
  getAdyenPaymentMethods,
  paymentMethods,
  acquirerInfo,
  adyenMakeDirectPayment,
  transaction,
  getAdyenPaymentDetails,
} = useAdyenDirectPayment(props.provider.id, props.cart?.order?.id);

onMounted(async () => {
  loading.value = true;
  await openAdyenTransaction();
  await getAdyenAcquirerInfo();
  await getAdyenPaymentMethods();

  const configuration = {
    locale: "en-EN",
    environment: acquirerInfo.value.state === "test" ? "test" : "live",
    clientKey: acquirerInfo.value.client_key,
    paymentMethodsResponse: paymentMethods.value,
    analytics: {
      enabled: false,
    },
    onPaymentCompleted: (result: any, component: any) => {
      router.push({ name: "paymentResponse" });
    },
    onError: (error: any, component: any) => {
      console.log(error);
      if (
        error.errorText !== "error was cleared" &&
        error.errorText !== "incomplete field"
      ) {
        /* send({
          message: error?.message || error?.errorI18n || error?.errorText,
          type: 'danger'
        }); */
      }

      emit("paymentLoading", false);
    },
    onAdditionalDetails: async (state: any) => {
      await getAdyenPaymentDetails({
        providerId: props.provider.id,
        transactionReference: transaction.value.reference,
        paymentDetails: state.data,
      });
    },
    onChange: (state: any, component: { isValid: boolean }) => {
      if (component.isValid) {
        emit("isPaymentReady", true);
        return;
      }
      emit("isPaymentReady", false);
    },

    onSubmit: async (state: any) => {
      emit("isPaymentReady", false);
      emit("paymentLoading", true);
      const response = await adyenMakeDirectPayment({
        providerId: props.provider.id,
        transactionReference: transaction.value.reference,
        paymentMethod: state.data.paymentMethod,
        accessToken: transaction.value.access_token,
        browserInfo: state.data?.browserInfo || {},
      });

      if (response.action?.type) {
        adyenDropin.value?.handleAction(response.action);
        emit("paymentLoading", false);
        return;
      }

      const data = await getPaymentConfirmation();
      const paymentSuccess =
        data?.order?.lastTransaction?.state === "Authorized" ||
        data.order?.lastTransaction?.state === "Confirmed";

      emit("paymentLoading", false);
      if (paymentSuccess) {
        router.push("/checkout/thank-you");
        return;
      }

      router.push("/payment-fail");
    },
  };

  const checkout = new AdyenCheckout(configuration);

  adyenDropin.value = checkout
    .create("dropin", {
      openFirstPaymentMethod: true,
      openFirstStoredPaymentMethod: false,
      showStoredPaymentMethods: false,
      showPaymentMethods: true,
      showPayButton: false,
      setStatusAutomatically: true,
      onSelect: (component) => {
        if (component.isValid) {
          emit("isPaymentReady", true);
          return;
        }
        emit("isPaymentReady", false);
      },
    })
    .mount("#dropin-container");

  loading.value = false;

  emit("providerPaymentHandler", adyenDropin.value.submit);
});

onBeforeUnmount(() => {
  adyenDropin.value?.unmount();
  adyenDropin.value = null;
});
</script>
