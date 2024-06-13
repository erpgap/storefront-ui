<script setup lang="ts">
import {
  SfButton,
  SfCheckbox,
  SfInput,
  SfLoaderCircular,
} from "@storefront-ui/vue";

import {
  AddressEnum,
  type AddAddressInput,
  type AddressFormFieldsInputExtendedFields,
  type UpdateAddressInput,
} from "~/graphql";

const { updateAddress, addAddress, loading } = useAddresses();

const emits = defineEmits(["on-save", "on-close"]);

const props = defineProps({
  type: {
    type: String as PropType<AddressEnum>,
    required: true,
  },
  isEditForm: {
    type: Boolean,
    required: true,
    default: false,
  },
  address: {
    type: Object as PropType<AddAddressInput | UpdateAddressInput>,
    default: () => ({}),
  },
});

const addressFormFieldsInput = ref<AddressFormFieldsInputExtendedFields>({
  id: 0,
  name: "",
  phone: "",
  city: "",
  email: "",
  countryId: 0,
  stateId: 0,
  street: "",
  zip: "",
  street2: "",
});

if (props.isEditForm) {
  addressFormFieldsInput.value.name = props.address?.name ?? "";
  addressFormFieldsInput.value.phone = props.address?.phone ?? "";
  addressFormFieldsInput.value.city = props.address?.city ?? "";
  addressFormFieldsInput.value.countryId = props.address?.country.id ?? 0;
  addressFormFieldsInput.value.stateId = props.address?.state.id ?? 0;
  addressFormFieldsInput.value.city = props.address?.city ?? "";
  addressFormFieldsInput.value.zip = props.address?.zip ?? "";
  addressFormFieldsInput.value.street = props.address?.street ?? "";
}

const billingAddresIsTheSameAsShipping = ref(false);

const handleSubmit = async () => {
  if (props.isEditForm) {
    addressFormFieldsInput.value.id = props.address?.id;
    await updateAddress(
      addressFormFieldsInput.value as UpdateAddressInput,
      props.type
    );

    emits("on-save");
    return;
  }
  delete addressFormFieldsInput.value["id"];
  await addAddress(addressFormFieldsInput.value as AddAddressInput, props.type);

  if (
    billingAddresIsTheSameAsShipping.value &&
    props.type === AddressEnum.Billing &&
    !props.isEditForm
  ) {
    await addAddress(
      addressFormFieldsInput.value as AddAddressInput,
      AddressEnum.Shipping
    );
  }
  emits("on-save");
};
</script>
<template>
  <form
    class="grid grid-cols-1 md:grid-cols-[50%_1fr_120px] gap-4"
    data-testid="address-form"
    @submit.prevent="handleSubmit"
  >
    <label>
      <UiFormLabel>{{ $t("form.NameLabel") }}</UiFormLabel>
      <SfInput
        v-model="addressFormFieldsInput.name"
        name="name"
        autocomplete="given-name"
        required
        :placeholder="$t('form.NameLabel')"
      />
    </label>
    <label class="md:col-span-2">
      <UiFormLabel>{{ $t("form.streetNameLabel") }}</UiFormLabel>
      <SfInput
        v-model="addressFormFieldsInput.street"
        name="streetName"
        autocomplete="family-name"
        required
        :placeholder="$t('form.streetNameLabel')"
      />
    </label>
    <label class="md:col-span-3">
      <UiFormLabel>{{ $t("form.phoneLabel") }}</UiFormLabel>
      <SfInput
        v-model="addressFormFieldsInput.phone"
        name="phone"
        type="tel"
        autocomplete="tel"
        required
        :placeholder="$t('form.phoneLabel')"
      />
    </label>

    <UiFormSelectCountries v-model="addressFormFieldsInput.countryId" />
    <UiFormSelectStates
      v-model="addressFormFieldsInput.stateId"
      :key="addressFormFieldsInput?.countryId"
      :country-id="addressFormFieldsInput?.countryId"
    />
    <label class="md:col-span-2">
      <UiFormLabel>{{ $t("form.cityLabel") }}</UiFormLabel>
      <SfInput
        v-model="addressFormFieldsInput.city"
        name="city"
        autocomplete="address-level2"
        required
        :placeholder="$t('form.cityLabel')"
      />
    </label>
    <label>
      <UiFormLabel>{{ $t("form.postalCodeLabel") }}</UiFormLabel>
      <SfInput
        v-model="addressFormFieldsInput.zip"
        name="postalCode"
        autocomplete="postal-code"
        required
        :placeholder="$t('form.postalCodeLabel')"
      />
    </label>
    <label
      v-if="!isEditForm && type === AddressEnum.Billing"
      class="md:col-span-2"
    >
      <SfCheckbox
        v-model="billingAddresIsTheSameAsShipping"
        name="billingAddresIsTheSameAsShipping"
      />
      {{ $t("account.accountSettings.billingDetails.sameAddress") }}
    </label>
    <div
      class="md:col-span-3 flex flex-col-reverse md:flex-row justify-end mt-6 gap-4"
    >
      <SfButton
        type="reset"
        class=""
        variant="secondary"
        @click="$emit('on-close')"
      >
        {{ $t("contactInfo.cancel") }}
      </SfButton>
      <SfButton type="submit" class="min-w-[120px]" :disabled="loading">
        <SfLoaderCircular
          v-if="loading"
          class="flex justify-center items-center"
          size="sm"
        />
        <span v-else>
          {{ $t("contactInfo.save") }}
        </span>
      </SfButton>
    </div>
  </form>
</template>

<style scoped></style>
