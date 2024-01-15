<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <AccountProfileData
    class="col-span-3"
    :header="$t('account.accountSettings.billingDetails.billingAddress')"
    :button-text="$t('account.accountSettings.billingDetails.edit')"
    @on-click="open"
  >
    <p>
      {{ user?.billingAddress?.name }}
    </p>
    <p>{{ user?.billingAddress?.phone }}</p>
    <p>{{ user?.billingAddress?.street }} {{ user?.billingAddress?.street2 }}</p>
    <p>
      {{ user?.billingAddress?.city }}, {{ user?.billingAddress?.state?.name }}
      {{ user?.billingAddress?.zip }}
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
      <FormAddAddress
        :saved-address="user?.billingAddress"
        type="billingAddress"
        @on-save="close"
        @on-close="close"
      />
    </SfModal>
  </UiOverlay>
</template>

<script setup lang="ts">
import {
  SfButton,
  SfIconClose,
  SfModal,
  useDisclosure,
} from '@storefront-ui/vue';

definePageMeta({
  layout: 'account',
});
const { isOpen, open, close } = useDisclosure();
const { user, loadUser } = useUser();

await loadUser();
</script>
