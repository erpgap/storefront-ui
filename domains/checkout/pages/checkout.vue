<script setup lang="ts">
import {
  SfButton,
  SfIconArrowBack,
  SfIconBlock,
  SfLink,
  SfListItem,
  SfLoaderCircular,
  SfRadio,
} from "@storefront-ui/vue";
import { useToast } from "vue-toastification";
import { AddressEnum, type Partner, type PaymentProvider } from "~/graphql";
const NuxtLink = resolveComponent("NuxtLink");

const { cart, loadCart, totalItemsInCart } = useCart();
const router = useRouter();

const { loadCountryList } = useCountry();
const { user, loadUser } = useAuth();

const { loadDeliveryMethods, deliveryMethods } = useDeliveryMethod();
const {
  loadPaymentMethods,
  paymentProviders,
  loading: paymentLoading,
} = usePayment();

await loadUser(true);
await Promise.all([
  loadCart(false),

  loadDeliveryMethods(),
  loadPaymentMethods(),
  loadCountryList(),
]);

if (totalItemsInCart?.value === 0) {
  router.push("/category/53");
}

const isLoading = false;

const showPaymentModal = ref(false);
const isPaymentReady = ref(false);
const providerPaymentHandler = ref();
const loading = ref(false);

onMounted(() => {
  if (paymentProviders?.value?.length) {
    showPaymentModal.value = true;
  }
});

onBeforeUnmount(() => {
  showPaymentModal.value = false;
});

const radioModel = ref("1");
const selectedProvider = ref<PaymentProvider | null>(
  paymentProviders.value?.[0] || null
);
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
    <div v-else-if="cart?.order?.id">
      <div class="lg:grid lg:grid-cols-12 md:gap-x-6">
        <div class="col-span-7 mb-10 md:mb-0">
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />

          <CheckoutContactInformation
            :heading="$t('contactInfo.heading')"
            :partner-data="cart.order?.partner as Partner"
          />

          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutAddressForm
            :heading="$t('shipping.heading')"
            :description="$t('shipping.description')"
            :button-text="$t('shipping.addButton')"
            :type="AddressEnum.Shipping"
            :saved-address="cart.order?.partnerShipping as Partner"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutAddressForm
            :heading="$t('billing.heading')"
            :description="$t('billing.description')"
            :button-text="$t('billing.addButton')"
            :type="AddressEnum.Billing"
            :saved-address="cart.order?.partnerInvoice as Partner"
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
          <ProviderListOptions
            :active-provider="selectedProvider || paymentProviders[0]"
            :payment-providers="paymentProviders"
            @update:active-payment="selectedProvider = $event"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0 mb-10" />
        </div>
        <UiOrderSummary class="col-span-5 md:sticky md:top-20 h-fit">
          <SfButton
            size="lg"
            class="w-full mb-4 md:mb-0"
            :disabled="!selectedProvider || !isPaymentReady || loading"
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
            :is="getPaymentProviderComponentName(selectedProvider.code)"
            v-if="showPaymentModal && !!selectedProvider?.code"
            :provider="selectedProvider"
            :cart="cart"
            @is-payment-ready="($event) => (isPaymentReady = $event)"
            @provider-payment-handler="
              ($event) => (providerPaymentHandler = $event)
            "
            @payment-loading="($event) => (loading = $event)"
          />
        </UiOrderSummary>
      </div>
    </div>
  </div>
</template>
