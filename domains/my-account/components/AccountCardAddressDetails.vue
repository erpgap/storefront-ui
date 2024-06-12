<script setup lang="ts">
import { SfButton, SfIconClose, useDisclosure } from "@storefront-ui/vue";
import {
  AddressEnum,
  type AddressFormFieldsInputExtendedFields,
  type Partner,
} from "~/graphql";

const { isOpen, open, close } = useDisclosure();
const { deleteAddress, loadAddresses } = useAddresses();

const props = defineProps({
  addresses: {
    type: Array as PropType<Partner[]>,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<AddressEnum.Billing | AddressEnum.Shipping>,
    required: true,
  },
});

const edit = ref(false);
const addressForEdit = ref<AddressFormFieldsInputExtendedFields>();

const handleOpenFormForEditAddress = (
  address: AddressFormFieldsInputExtendedFields
) => {
  edit.value = true;
  addressForEdit.value = address;
  open();
};

const handleOpenFormToAddAddress = () => {
  edit.value = false;
  open();
};

const handleRemoveAddress = async (id: number) => {
  deleteAddress({ id: id });
  await loadAddresses(props.type);
};

const handleCloseAfterSaveAddress = async () => {
  await loadAddresses(props.type);
  close();
};
</script>
<template>
  <div
    class="md:col-span-1 col-span-3"
    v-for="address in addresses"
    :key="address.id"
  >
    <AccountAddressData
      @on-click="handleOpenFormForEditAddress(address)"
      :header="address.name || ''"
      :button-text="$t('account.accountSettings.personalData.edit')"
    >
      <p>{{ `${address.name}, ${address.street}` }}</p>
      <p>{{ address.phone }}</p>
      <p>{{ `${address.country?.name}` }}</p>
      <p>{{ `${address?.state?.name || ""}` }}</p>
      <p>{{ `${address.city} ${address.zip}` }}</p>
      <template v-slot:footer>
        <SfButton
          variant="secondary"
          size="sm"
          class="self-start"
          @click="handleRemoveAddress(address.id)"
          >Remove</SfButton
        >
      </template>
    </AccountAddressData>
  </div>
  <div class="col-span-3">
    <SfButton size="lg" @click="handleOpenFormToAddAddress()" class="self-start"
      >Add new address</SfButton
    >
  </div>
  <UiOverlay v-if="isOpen" :visible="isOpen">
    <UiModal
      :model-value="isOpen"
      tag="section"
      role="dialog"
      class="h-full w-full overflow-auto md:w-[600px] md:h-fit z-50"
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
          {{ header }}
        </h3>
      </header>
      <AccountFormAddress
        :is-edit-form="edit"
        :address="addressForEdit"
        :type="AddressEnum.Billing"
        @on-save="handleCloseAfterSaveAddress"
        @on-close="close"
      />
    </UiModal>
  </UiOverlay>
</template>
