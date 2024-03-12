<script setup lang="ts">
import {
  SfButton,
  SfIconArrowBack,
  SfLoaderCircular,
  SfIconClose,
  useDisclosure,
  SfModal,
  SfIconBlock,
  SfListItem,
  SfRadio,
  SfLink,
} from "@storefront-ui/vue";
import { useDeliveryMethod } from "~/composables/useDeliveryMethod";
import { AddressEnum } from "~/graphql";

const NuxtLink = resolveComponent("NuxtLink");
const { isOpen, open, close } = useDisclosure();
const { cart, loadCart } = useCart();
const { loadAddressesByType, mailingAddresses, billingAddresses } =
  useAddresses();
const { loadCountryList } = useCountry();
const { updatePartner } = usePartner();
const { loadDeliveryMethods, deliveryMethods } = useDeliveryMethod();
const {
  loadPaymentMethods,
  paymentMethods,
  loading: paymentLoading,
} = usePayment();

await loadCart();
await loadAddressesByType(AddressEnum.Shipping);
await loadAddressesByType(AddressEnum.Billing);
await loadDeliveryMethods();
await loadPaymentMethods();
await loadCountryList();

const savedMailingAddress = computed(() => mailingAddresses.value[0] || null);
const savedBillingAddress = computed(() => billingAddresses.value[0] || null);

const partnerData = computed(() => {
  const email = cart.value.order?.partner?.email || "";
  const name = cart.value.order?.partner?.name || "";
  return {
    email: email.includes("newEmail") ? "" : email ?? "",
    name: name.includes("newName") ? "" : name ?? "",
  };
});
const isLoading = false;

const showPaymentModal = ref(false);
const isPaymentReady = ref(false);
const providerPaymentHandler = ref();
const methodWithModal = ref();
const loading = ref(false);

const updatePartnerData = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  await updatePartner({
    email,
    name: name,
    subscribeNewsletter: false,
  });
  await loadCart();
  close();
};

onMounted(() => {
  if (paymentMethods.value.length) {
    showPaymentModal.value = true;
  }
});

onBeforeUnmount(() => {
  showPaymentModal.value = false;
});

const radioModel = ref("1");
const selectedProvider = ref(1);
</script>

<template>
  <div class="md:px-0 mb-20">
    <div class="flex justify-between mt-8 mb-10">
      <h1 class="font-bold typography-headline-3 md:typography-headline-2">
        Checkout
      </h1>
      <SfButton
        :tag="NuxtLink"
        to="/cart"
        class="flex md:hidden whitespace-nowrap"
        size="sm"
        variant="tertiary"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t("back") }}
      </SfButton>
      <SfButton
        :tag="NuxtLink"
        to="/cart"
        class="hidden md:flex"
        variant="tertiary"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t("backToCart") }}
      </SfButton>
    </div>
    <span v-if="isLoading" class="!flex justify-center my-40 h-24">
      <SfLoaderCircular size="3xl" />
    </span>
    <div v-else>
      <div class="lg:grid lg:grid-cols-12 md:gap-x-6">
        <div class="col-span-7 mb-10 md:mb-0">
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />

          <div data-testid="contact-information" class="md:px-4 py-6">
            <div class="flex justify-between items-center">
              <h2 class="text-neutral-900 text-lg font-bold mb-4">
                {{ $t("contactInfo.heading") }}
              </h2>
              <SfButton
                v-if="partnerData?.email"
                size="sm"
                variant="tertiary"
                @click="open"
              >
                {{ $t("contactInfo.edit") }}
              </SfButton>
            </div>
            <div v-if="partnerData?.email" class="mt-2 md:w-[520px]">
              <p>{{ partnerData.name }}</p>
              <p>{{ partnerData?.email }}</p>
            </div>
            <div v-else class="w-full md:max-w-[520px]">
              <p>{{ $t("contactInfo.description") }}</p>
              <SfButton
                class="mt-4 w-full md:w-auto"
                variant="secondary"
                @click="open"
              >
                {{ $t("contactInfo.add") }}
              </SfButton>
            </div>

            <SfModal
              v-model="isOpen"
              tag="section"
              role="dialog"
              class="h-full w-full overflow-auto md:w-[600px] md:h-fit z-50"
              aria-labelledby="contact-modal-title"
            >
              <header>
                <SfButton
                  square
                  variant="tertiary"
                  class="absolute right-2 top-2"
                  @click="close"
                >
                  <SfIconClose />
                </SfButton>
                <h3
                  id="contact-modal-title"
                  class="text-neutral-900 text-lg md:text-2xl font-bold mb-4"
                >
                  {{ $t("contactInfo.heading") }}
                </h3>
              </header>
              <FormContactInformation
                :email="partnerData.email"
                :name="partnerData.name"
                @on-save="updatePartnerData"
                @on-cancel="close"
              />
            </SfModal>
          </div>

          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutAddressForm
            :heading="$t('shipping.heading')"
            :description="$t('shipping.description')"
            :button-text="$t('shipping.addButton')"
            :saved-address="savedMailingAddress"
            type="shippingAddress"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutAddressForm
            :heading="$t('billing.heading')"
            :description="$t('billing.description')"
            :button-text="$t('billing.addButton')"
            :saved-address="savedBillingAddress"
            type="billingAddress"
          />

          <UiDivider class-name="w-screen md:w-auto -mx-4 md:mx-0" />
          <div data-testid="shipping-method" class="md:px-4 my-6">
            <div class="flex justify-between items-center">
              <h3 class="text-neutral-900 text-lg font-bold">
                {{ $t("shippingMethod.heading") }}
              </h3>
            </div>
            <div class="mt-4">
              <ul
                v-if="deliveryMethods.length"
                class="grid gap-y-4 md:grid-cols-2 md:gap-x-4"
                role="radiogroup"
              >
                <SfListItem
                  v-for="{ id, name, price } in deliveryMethods"
                  :key="id"
                  tag="label"
                  class="border rounded-md items-start"
                  @click="radioModel = `${id}`"
                >
                  <div class="flex gap-2">
                    <SfRadio v-model="radioModel" :value="`${id}`" />
                    <div>
                      <p>{{ name }}</p>
                      <p class="text-xs text-neutral-500">tomorrow</p>
                    </div>
                  </div>
                </SfListItem>
              </ul>

              <div v-else class="flex mb-6">
                <SfIconBlock class="mr-2 text-neutral-500" />
                <p>{{ $t("shippingMethod.description") }}</p>
              </div>
            </div>
          </div>
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutPaymentMethod
            :active-payment="selectedProvider"
            :payment-methods="paymentMethods"
            @update:active-payment="selectedProvider = $event"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0 mb-10" />
        </div>
        <UiOrderSummary class="col-span-5 md:sticky md:top-20 h-fit">
          <SfButton
            size="lg"
            class="w-full mb-4 md:mb-0"
            @click="providerPaymentHandler"
            :disabled="!selectedProvider || !isPaymentReady || loading"
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
          <LazyCheckoutAdyenPaymentProvider
            :provider="paymentMethods[0]"
            :cart="cart"
            v-if="showPaymentModal && paymentMethods[0]"
            @isPaymentReady="($event) => (isPaymentReady = $event)"
            @providerPaymentHandler="
              ($event) => (providerPaymentHandler = $event)
            "
            @paymentLoading="($event) => (loading = $event)"
          />
        </UiOrderSummary>
      </div>
    </div>
  </div>
</template>
