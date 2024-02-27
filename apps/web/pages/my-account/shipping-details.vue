<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <div v-for="address in mailingAddresses">
    <AccountProfileData
      class="col-span-3"
      :header="$t('account.accountSettings.shippingDetails.shippingAddress')"
      :button-text="$t('account.accountSettings.personalData.edit')"
      @on-click="open"
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
    </AccountProfileData>
    <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
    <UiOverlay v-if="isOpen" :visible="isOpen">
      <SfModal
        v-model="isOpen"
        tag="section"
        role="dialog"
        class="h-full w-full overflow-auto md:w-[600px] md:h-fit"
        aria-labelledby="address-modal-title"
      >
        <header>
          <SfButton square variant="tertiary" class="absolute right-2 top-2" @click="close">
            <SfIconClose />
          </SfButton>
          <h3 id="address-modal-title" class="text-neutral-900 text-lg md:text-2xl font-bold mb-4">
            {{ $t('account.accountSettings.shippingDetails.shippingAddress') }}
          </h3>
        </header>
        <FormAddAddress :saved-address="address" type="shippingAddress" @on-save="close" @on-close="close" />
      </SfModal>
    </UiOverlay>
  </div>
</template>

<script setup lang="ts">
import { SfButton, SfIconClose, SfModal, useDisclosure } from '@storefront-ui/vue';
import { AddressEnum } from '~/graphql';

definePageMeta({
  layout: 'account',
});
const { isOpen, open, close } = useDisclosure();
const { mailingAddresses, loadAddressesByType } = useAddresses();

await loadAddressesByType(AddressEnum.Shipping);
</script>
