<script setup lang="ts">
import {
  SfButton,
  SfIconClose,
  useDisclosure,
  SfInput,
  SfLoaderCircular,
  SfSelect,
} from "@storefront-ui/vue";
import { AddressEnum, Partner } from "~/graphql";

defineProps<{
  addresses: Partner[];
  type: string;
  header: string;
}>();

const { isOpen, open, close } = useDisclosure();
const {
  deleteAddress,
  updateAddress,
  addAddress,
  loadBillingAddresses,
  loadShippingAddresses,
} = useAddresses();
const { countries, loadCountryList } = useCountry();

const defaultValues = ref({
  name: "",
  street: "",
  street2: "",
  phone: "",
  countryId: null,
  city: "",
  stateId: null,
  zip: "",
});

const editAddress = (address: Partner) => {
  defaultValues.value = {
    id: address?.id,
    countryId: address.country?.id,
    stateId: address.state?.id,
    ...address,
  };
  open();
};

const newAddress = () => {
  Object.assign(defaultValues.value, {
    id: "",
    name: "",
    street: "",
    street2: "",
    phone: "",
    countryId: null,
    city: "",
    stateId: null,
    zip: "",
  });
  open();
};

const removeAddress = (id) => {
  deleteAddress({ id: id });
  if (type === AddressEnum.Billing) {
    loadBillingAddresses();
  } else {
    loadShippingAddresses();
  }
};

const submitAddress = () => {
  const addressInput = {
    name: defaultValues.value.name,
    street: defaultValues.value.street,
    street2: defaultValues.value.street2,
    phone: defaultValues.value.phone,
    countryId: defaultValues.value.countryId,
    city: defaultValues.value.city,
    stateId: defaultValues.value.stateId,
    zip: defaultValues.value.zip,
  };

  const addressType =
    type === AddressEnum.Billing ? AddressEnum.Billing : AddressEnum.Shipping;

  if (defaultValues.value?.id) {
    updateAddress({ id: defaultValues.value.id, ...addressInput }, addressType);
  } else {
    addAddress(addressInput, addressType);
  }
  close();
};

const states = computed(
  () =>
    countries.value.find(
      (country: any) => country.id === defaultValues.value.countryId
    )?.states || []
);

await loadCountryList();
</script>
<template>
  <div v-for="address in addresses" :key="address.id">
    <AccountAddressData
      @on-click="editAddress(address)"
      :header="address.name"
      :button-text="$t('account.accountSettings.personalData.edit')"
    >
      <p>{{ `${address.name}, ${address.street}` }}</p>
      <p>{{ address.phone }}</p>
      <p>{{ `${address.country?.name}` }}</p>
      <p>{{ `${address.state?.name}` }}</p>
      <p>{{ `${address.city} ${address.zip}` }}</p>
      <template v-slot:footer>
        <SfButton
          variant="tertiary"
          size="sm"
          class="self-start"
          @click="removeAddress(address.id)"
          >Remove</SfButton
        >
        <SfButton
          variant="secondary"
          size="sm"
          class="self-start"
          @click="selectCurrentAddress({ id: address.id }, AddressEnum.Billing)"
          >Current</SfButton
        >
      </template>
    </AccountAddressData>
  </div>
  <div class="col-span-3">
    <SfButton size="lg" @click="newAddress()" class="self-start"
      >Add new address</SfButton
    >
  </div>
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
    <form
      class="grid grid-cols-1 md:grid-cols-[50%_1fr_120px] gap-4"
      data-testid="address-form"
      @submit.prevent="submitAddress"
    >
      <label>
        <UiFormLabel>{{ $t("form.NameLabel") }}</UiFormLabel>
        <SfInput
          v-model="defaultValues.name"
          name="name"
          autocomplete="given-name"
          required
          :placeholder="$t('form.NameLabel')"
        />
      </label>
      <label class="md:col-span-2">
        <UiFormLabel>{{ $t("form.streetNameLabel") }}</UiFormLabel>
        <SfInput
          v-model="defaultValues.street"
          name="streetName"
          autocomplete="family-name"
          required
          :placeholder="$t('form.streetNameLabel')"
        />
      </label>
      <label class="md:col-span-3">
        <UiFormLabel>{{ $t("form.phoneLabel") }}</UiFormLabel>
        <SfInput
          v-model="defaultValues.phone"
          name="phone"
          type="tel"
          autocomplete="tel"
          required
          :placeholder="$t('form.phoneLabel')"
        />
      </label>
      <label class="md:col-span-3">
        <UiFormLabel>{{ $t("form.countryLabel") }}</UiFormLabel>
        <SfSelect
          v-model="defaultValues.countryId"
          name="country"
          autocomplete="country-name"
          required
        >
          <option key="placeholder" :value="null">
            {{ $t("form.selectPlaceholder") }}
          </option>
          <option
            v-for="country in countries"
            :key="country.id"
            :value="country.id"
          >
            {{ country.name }}
          </option>
        </SfSelect>
      </label>
      <label class="md:col-span-3">
        <UiFormLabel>{{ $t("form.stateLabel") }}</UiFormLabel>
        <SfSelect
          v-model="defaultValues.stateId"
          name="state"
          autocomplete="state-name"
          :disabled="!states.length"
          required
        >
          <option key="placeholder" :value="null">
            {{ $t("form.selectPlaceholder") }}
          </option>
          <option v-for="state in states" :key="state.id" :value="state.id">
            {{ state.name }}
          </option>
        </SfSelect>
      </label>

      <label class="md:col-span-2">
        <UiFormLabel>{{ $t("form.cityLabel") }}</UiFormLabel>
        <SfInput
          v-model="defaultValues.city"
          name="city"
          autocomplete="address-level2"
          required
          :placeholder="$t('form.cityLabel')"
        />
      </label>
      <label>
        <UiFormLabel>{{ $t("form.postalCodeLabel") }}</UiFormLabel>
        <SfInput
          v-model="defaultValues.zip"
          name="postalCode"
          autocomplete="postal-code"
          required
          :placeholder="$t('form.postalCodeLabel')"
        />
      </label>

      <div
        class="md:col-span-3 flex flex-col-reverse md:flex-row justify-end mt-6 gap-4"
      >
        <SfButton type="reset" class="" variant="secondary" @click="close">
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
  </UiModal>
</template>

<style scoped></style>
