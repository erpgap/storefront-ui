<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <div v-for="address in billingAddresses" :key="address.id">
    <AccountAddressData
      @on-click="open"
      :header="address.name"
      :button-text="$t('account.accountSettings.personalData.edit')"
    >
      <p>
        {{ address?.name }}
      </p>
      <p>{{ address?.phone }}</p>
      <p>{{ address?.street }} {{ address?.street2 }}</p>
      <p>
        {{ address?.city }}, {{ address?.state?.name }}
        {{ address?.zip }}
      </p>
      <template v-slot:footer>
        <SfButton
          variant="tertiary"
          size="sm"
          class="self-start"
          @click="deleteAddress({ id: address.id })"
          >Remove</SfButton
        >
        <SfButton
          :disabled="currentBillingAddress?.selectAddress?.id === address.id"
          variant="secondary"
          size="sm"
          class="self-start"
          @click="selectCurrentAddress({ id: address.id }, AddressEnum.Billing)"
          >Current</SfButton
        >
      </template>
    </AccountAddressData>

    <UiOverlay v-if="isOpen" :visible="isOpen">
      <SfModal
        v-model="isOpen"
        tag="section"
        role="dialog"
        class="h-full w-full overflow-auto md:w-[600px] md:h-fit"
        aria-labelledby="address-modal-title"
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
            id="address-modal-title"
            class="text-neutral-900 text-lg md:text-2xl font-bold mb-4"
          >
            {{ $t("account.accountSettings.billingDetails.billingAddress") }}
          </h3>
        </header>
        <FormAddAddress
          :saved-address="address"
          type="billingAddress"
          @on-save="close"
          @on-close="close"
        />
      </SfModal>
    </UiOverlay>
  </div>
</template>

<script setup lang="ts">
import {
  SfButton,
  SfIconClose,
  SfModal,
  useDisclosure,
} from "@storefront-ui/vue";
import { AddressEnum } from "~/graphql";

definePageMeta({
  layout: "account",
});
const { isOpen, open, close } = useDisclosure();
const {
  billingAddresses,
  currentBillingAddress,
  selectCurrentAddress,
  loadAddressesByType,
  deleteAddress,
} = useAddresses();

await loadAddressesByType(AddressEnum.Billing);
</script>
