<template>
    <form @submit.prevent="$emit('on-save', addressData)" data-testid="account-forms-name">
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.name')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.name"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.street')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.street"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.street2')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.street2"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.city')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.city"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.zip')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.zip"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.country')
          }}</UiFormLabel>
          <SfSelect
            v-model="addressData.country.id"
            name="country"
            required
          >
            <option
              v-for="countryOption in countries"
              :key="countryOption.id"
              :value="countryOption.id"
            >
              {{ countryOption.name }}
            </option>
          </SfSelect>
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.state')
          }}</UiFormLabel>
          <SfSelect
            v-model="addressData.state.id"
            name="state"
            required
          >
            <option
              v-for="countryStateOption in countryStates"
              :key="countryStateOption.id"
              :value="countryStateOption.id"
            >
              {{ countryStateOption.name }}
            </option>
          </SfSelect>
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.phone')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.phone"
            required
          />
        </label>
        <label class="block flex-1">
          <UiFormLabel>{{
            $t('account.accountSettings.addresses.email')
          }}</UiFormLabel>
          <SfInput
            name="fullname"
            type="text"
            v-model="addressData.email"
            required
          />
        </label>
      <div class="mt-6 flex flex-col-reverse md:flex-row md:justify-end gap-4">
        <SfButton type="reset" variant="secondary" @click="$emit('on-cancel')">
          {{ $t('contactInfo.cancel') }}
        </SfButton>
        <SfButton type="submit" class="min-w-[120px]">
          {{ $t('contactInfo.save') }}
        </SfButton>
      </div>
    </form>
  </template>
<script lang="ts" setup>
import { SfButton, SfInput, SfSelect } from '@storefront-ui/vue';
import { Partner } from '~/graphql';

type AccountFormsAddressProps = {
  address: Partner;
};

const { countries, countryStates, loadCountries, loadCountryStates } = useCountries();

const props = defineProps<AccountFormsAddressProps>();
const { name, street, street2, zip, city, state, country, phone, email } = toRefs(props.address);
defineEmits(['on-save', 'on-cancel']);
const addressData = ref({
  name: name?.value ?? '',
  street: street?.value ?? '',
  street2: street2?.value ?? '',
  zip: zip?.value ?? '',
  city: city?.value ?? '',
  state: { id: String(state?.value?.id) || '' },
  country: { id: String(country?.value?.id) || '' },
  phone: phone?.value ?? '',
  email: email?.value ?? '',
});

onBeforeMount(async () => {
  await loadCountries();
  if (addressData?.value.country.id && addressData?.value.country.id !== 'null') {
    await loadCountryStates(addressData?.value.country.id);
  }
});

watch(
  () => addressData.value.country.id,
  async () => {
    console.log('caiu');
    await loadCountryStates(addressData?.value.country.id);
    if (!countryStates.value || countryStates.value.length === 0) {
      addressData.value.state.id = '';
    }
  }
);
</script>

