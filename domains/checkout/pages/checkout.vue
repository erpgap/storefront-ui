<script setup lang="ts">
import { useCountryList } from "~/domains/core/composable/useCountryList";
import { AddressEnum, type Partner } from "~/graphql";

const { cart, loadCart, totalItemsInCart } = useCart();
const { loadCountries } = useCountryList();
const router = useRouter();

const { loadUser } = useAuth();

await loadUser(true);
await loadCart(false);
await loadCountries();

if (totalItemsInCart?.value === 0) {
  router.push("/category/53");
}
</script>
<template>
  <div class="md:px-0 mb-20">
    <CheckoutHeader />
    <div v-if="cart?.order?.id">
      <div class="lg:grid lg:grid-cols-12 md:gap-x-6">
        <div class="col-span-7 mb-10 md:mb-0">
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />

          <LazyCheckoutContactInformation
            v-if="cart?.order?.partner"
            :heading="$t('contactInfo.heading')"
            :partner-data="cart?.order?.partner as Partner"
          />

          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <LazyCheckoutAddressForm
            :heading="$t('shipping.heading')"
            :description="$t('shipping.description')"
            :button-text="$t('shipping.addButton')"
            :type="AddressEnum.Shipping"
            :saved-address="cart.order?.partnerShipping as Partner"
          />
          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />
          <LazyCheckoutAddressForm
            :heading="$t('billing.heading')"
            :description="$t('billing.description')"
            :button-text="$t('billing.addButton')"
            :type="AddressEnum.Billing"
            :saved-address="cart.order?.partnerInvoice as Partner"
          />

          <UiDivider class-name="w-screen md:w-auto -mx-4 md:mx-0" />

          <LazyCheckoutShippingMethod />

          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0" />

          <LazyCheckoutPayment />

          <UiDivider class="w-screen md:w-auto -mx-4 md:mx-0 mb-10" />
        </div>
        <div class="col-span-5 md:sticky md:top-20 h-fit">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  </div>
</template>
