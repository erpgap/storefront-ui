<template>
  <div class="flex flex-col col-span-3">
  <div v-for="address in billingAddresses" :key="address.id">
    <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
    <div class="flex items-center">
        <AccountAddressData
        class="col-span-3"
        :header="$t('account.accountSettings.billingDetails.billingAddress')"
        :button-text="$t('account.accountSettings.billingDetails.edit')"
        :delete-text="$t('account.accountSettings.billingDetails.delete')"
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
        </AccountAddressData>
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
              {{ $t('account.accountSettings.billingDetails.billingAddress') }}
            </h3>
          </header>
          <AccountFormsAddress
            :address="address"
            type="billingAddress"
            @on-save="close"
            @on-close="close"
          />
        </SfModal>
      </UiOverlay>
    </div>
  </div>
  <SfButton @click="open" class="mt-2" type="submit" size="lg">
    {{ $t('account.accountSettings.billingDetails.addAddress') }}
 </SfButton>
</div>
</template>

<script setup lang="ts">
import {
  SfButton,
  SfIconClose,
  SfModal,
  SfRadio,
  useDisclosure,
} from '@storefront-ui/vue';
import { AddressEnum } from '~/graphql';

definePageMeta({
  layout: 'account',
});
const { isOpen, open, close } = useDisclosure();
const { billingAddresses, loadAddressesByType } = useAddresses();

await loadAddressesByType(AddressEnum.Billing);
</script>
