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
} from '@storefront-ui/vue';
import { AddressEnum } from '~/graphql';

enum PaymentMethod {
  CreditCard = 'credit-card',
  PayPal = 'pay-pal',
  ApplePay = 'apple-pay',
  GooglePay = 'google-pay',
}

const NuxtLink = resolveComponent('NuxtLink');
const { isOpen, open, close } = useDisclosure();

const { cart, loadCart } = useCart();
const { loadAddressesByType, mailingAddresses, billingAddresses } = useAddresses();
const { loadCountryList } = useCountry();
const { updatePartner } = usePartner();

await loadCart();
await loadAddressesByType(AddressEnum.Shipping);
await loadAddressesByType(AddressEnum.Billing);

await loadCountryList();

const savedMailingAddress = computed(() => mailingAddresses.value[0] || null);
const savedBillingAddress = computed(() => billingAddresses.value[0] || null);
const partnerEmail = cart.value.order?.partner?.email || undefined;
const isLoading = false;

const updatePartnerEmail = async (email: string) => {
  await updatePartner({ email });
  close();
};

const shippingMethods = ref([
  {
    id: '1',
    name: 'Free Delivery charge',
    estimatedDelivery: 'tomorrow',
  },
]);
const radioModel = ref('1');
const activePayment = ref<PaymentMethod>(PaymentMethod.CreditCard);
const data = ref({
  length: 1,
  totalPrice: '89.95',
  subtotalRegularPrice: '100.99',
  totalCouponDiscounts: '20',
  shippingPrice: '0',
  totalTax: '1.38',
});
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
        {{ $t('back') }}
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
        {{ $t('backToCart') }}
      </SfButton>
    </div>
    <span class="!flex justify-center my-40 h-24" v-if="isLoading">
      <SfLoaderCircular size="3xl" />
    </span>
    <div v-else>
      <div class="lg:grid lg:grid-cols-12 md:gap-x-6">
        <div class="col-span-7 mb-10 md:mb-0">
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />

          <div data-testid="contact-information" class="md:px-4 py-6">
            <div class="flex justify-between items-center">
              <h2 class="text-neutral-900 text-lg font-bold mb-4">
                {{ $t('contactInfo.heading') }}
              </h2>
              <SfButton
                v-if="partnerEmail"
                size="sm"
                variant="tertiary"
                @click="open"
              >
                {{ $t('contactInfo.edit') }}
              </SfButton>
            </div>
            <div v-if="partnerEmail" class="mt-2 md:w-[520px]">
              <p>{{ partnerEmail }}</p>
            </div>
            <div v-else class="w-full md:max-w-[520px]">
              <p>{{ $t('contactInfo.description') }}</p>
              <SfButton
                class="mt-4 w-full md:w-auto"
                variant="secondary"
                @click="open"
              >
                {{ $t('contactInfo.add') }}
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
                  {{ $t('contactInfo.heading') }}
                </h3>
              </header>
              <FormContactInformation :email="partnerEmail" @on-save="updatePartnerEmail" @on-cancel="close" />
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
                {{ $t('shippingMethod.heading') }}
              </h3>
            </div>
            <div class="mt-4">
              <ul
                v-if="shippingMethods"
                class="grid gap-y-4 md:grid-cols-2 md:gap-x-4"
                role="radiogroup"
              >
                <SfListItem
                  v-for="{ id, name, estimatedDelivery } in shippingMethods"
                  tag="label"
                  :key="id"
                  class="border rounded-md items-start"
                  @click="radioModel = id"
                >
                  <div class="flex gap-2">
                    <SfRadio v-model="radioModel" checked="1" :value="id" />
                    <div>
                      <p>{{ name }}</p>
                      <p class="text-xs text-neutral-500">
                        {{ estimatedDelivery }}
                      </p>
                    </div>
                  </div>
                </SfListItem>
              </ul>

              <div v-else class="flex mb-6">
                <SfIconBlock class="mr-2 text-neutral-500" />
                <p>{{ $t('shippingMethod.description') }}</p>
              </div>
            </div>
          </div>
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <CheckoutPaymentMethod
            :active-payment="activePayment"
            @update:active-payment="activePayment = $event"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0 mb-10" />
        </div>
        <UiOrderSummary
          v-if="data"
          :cart="data"
          class="col-span-5 md:sticky md:top-20 h-fit"
        >
          <SfButton
            :tag="NuxtLink"
            to="/checkout"
            size="lg"
            class="w-full mb-4 md:mb-0"
          >
            {{ $t('placeOrder') }}
          </SfButton>
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
        </UiOrderSummary>
      </div>
    </div>
  </div>
</template>
