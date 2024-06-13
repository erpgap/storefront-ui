<script setup lang="ts">
import { AddressEnum } from "~/graphql";

definePageMeta({
  layout: "account",
  middleware: ["auth-check"],
});

const { billingAddresses, loadAddresses } = useAddresses();

onMounted(async () => {
  await loadAddresses(AddressEnum.Billing);
});
</script>
<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <AccountCardAddressDetails
    :addresses="billingAddresses"
    :type="AddressEnum.Billing"
    :header="$t('billing.heading')"
  />
</template>
