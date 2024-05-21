<script setup lang="ts">
import { AddressEnum } from "~/graphql";

definePageMeta({
  layout: "account",
});
const { mailingAddresses, loadShippingAddresses } = useAddresses();

await loadShippingAddresses();
</script>
<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <AccountFormAddress
    :addresses="mailingAddresses"
    :type="AddressEnum.Shipping"
    :header="$t('shipping.heading')"
  />
</template>
