<script lang="ts" setup>
import {
  SfButton,
  SfIconClose,
  useDisclosure,
  SfModal,
  SfCheckbox,
  SfInput,
  SfLoaderCircular,
  SfSelect,
} from '@storefront-ui/vue';
import { AddressEnum } from '~/graphql';

const props = defineProps({
  heading: String,
  description: String,
  buttonText: String,
  type: String,
  savedAddress: {
    type: Object,
    default: () => {},
  },
});

const { savedAddress }: any = toRefs(props);
const { isOpen, open, close } = useDisclosure();
const { addAddress, updateAddress } = useAddresses();
const { countries } = useCountry();

const isCartUpdateLoading = false;

const defaultValues = ref({
  name: props.savedAddress?.name ?? '',
  street: props.savedAddress?.street ?? '',
  street2: props.savedAddress?.street2 ?? '',
  phone: props.savedAddress?.phone ?? '',
  countryId: props.savedAddress?.country?.id ?? null,
  city: props.savedAddress?.city ?? '',
  stateId: props.savedAddress?.state?.id ?? null,
  zip: props.savedAddress?.zip ?? '',
});

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
    email: props.savedAddress?.email,
  };

  const addressType = props.type === 'billingAddress' ? AddressEnum.Billing : AddressEnum.Shipping;

  if (props.savedAddress?.id) {
    updateAddress({ id: props.savedAddress.id, ...addressInput }, addressType);
  } else {
    addAddress(addressInput, addressType);
  }
  close();
};

const states = computed(() => countries.value.find((country: any) => country.id === defaultValues.value.countryId)?.states || []);

</script>

<template>
  <div data-testid="checkout-address" class="md:px-4 py-6">
    <div class="flex justify-between items-center">
      <h2 class="text-neutral-900 text-lg font-bold mb-4">
        {{ props.heading }}
      </h2>
      <SfButton v-if="savedAddress" size="sm" variant="tertiary" @click="open">
        {{ $t('contactInfo.edit') }}
      </SfButton>
    </div>

    <div v-if="savedAddress" class="mt-2 md:w-[520px]">
      <p>{{ `${savedAddress.name}, ${savedAddress.street}`}}</p>
      <p>{{ savedAddress.phone }}</p>
      <p>{{ `${savedAddress.country.name}` }}</p>
      <p>{{ `${savedAddress.state?.name}` }}</p>
      <p>{{ `${savedAddress.city} ${savedAddress.zip}` }}</p>
    </div>

    <div v-if="!savedAddress" class="w-full md:max-w-[520px]">
      <p>{{ props.description }}</p>
      <SfButton class="mt-4 w-full md:w-auto" variant="secondary" @click="open">
        {{ props.buttonText }}
      </SfButton>
    </div>

    <SfModal v-model="isOpen" tag="section" role="dialog" class="h-full w-full overflow-auto md:w-[600px] md:h-fit z-50"
      aria-labelledby="address-modal-title">
      <header>
        <SfButton square variant="tertiary" class="absolute right-2 top-2" @click="close">
          <SfIconClose />
        </SfButton>
        <h3 id="address-modal-title" class="text-neutral-900 text-lg md:text-2xl font-bold mb-4">
          {{ heading }}
        </h3>
      </header>
      <form class="grid grid-cols-1 md:grid-cols-[50%_1fr_120px] gap-4" data-testid="address-form"
        @submit.prevent="submitAddress">
        <label>
          <FormLabel>{{ $t('form.NameLabel') }}</FormLabel>
          <SfInput name="name" autocomplete="given-name" v-model="defaultValues.name" required />
        </label>
        <label class="md:col-span-2">
          <FormLabel>{{ $t('form.streetNameLabel') }}</FormLabel>
          <SfInput name="streetName" autocomplete="family-name" v-model="defaultValues.street" required />
        </label>
        <label class="md:col-span-3">
          <FormLabel>{{ $t('form.phoneLabel') }}</FormLabel>
          <SfInput name="phone" type="tel" autocomplete="tel" v-model="defaultValues.phone" required />
        </label>
        <label class="md:col-span-3">
          <FormLabel>{{ $t('form.countryLabel') }}</FormLabel>
          <SfSelect v-model="defaultValues.countryId" name="country" :placeholder="$t('form.selectPlaceholder')"
            autocomplete="country-name" required>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </SfSelect>
        </label>
        <label class="md:col-span-3">
          <FormLabel>{{ $t('form.stateLabel') }}</FormLabel>
          <SfSelect v-model="defaultValues.stateId" name="state" :placeholder="$t('form.selectPlaceholder')"
            autocomplete="state-name" :disabled="!states.length" required>
            <option v-for="state in states" :key="state.id" :value="state.id">{{ state.name }}</option>
          </SfSelect>
        </label>

        <label class="md:col-span-2">
          <FormLabel>{{ $t('form.cityLabel') }}</FormLabel>
          <SfInput name="city" autocomplete="address-level2" v-model="defaultValues.city" required />
        </label>
        <label>
          <FormLabel>{{ $t('form.postalCodeLabel') }}</FormLabel>
          <SfInput name="postalCode" autocomplete="postal-code" v-model="defaultValues.zip" required />
        </label>

        <label v-if="props.type === 'billingAddress'" class="md:col-span-3 flex items-center gap-2">
          <SfCheckbox name="useAsShipping" />
          {{ $t('form.useAsShippingLabel') }}
        </label>

        <div class="md:col-span-3 flex flex-col-reverse md:flex-row justify-end mt-6 gap-4">
          <SfButton type="reset" class="" variant="secondary" @click="close">
            {{ $t('contactInfo.cancel') }}
          </SfButton>
          <SfButton type="submit" class="min-w-[120px]" :disabled="isCartUpdateLoading">
            <SfLoaderCircular v-if="isCartUpdateLoading" class="flex justify-center items-center" size="sm" />
            <span v-else>
              {{ $t('contactInfo.save') }}
            </span>
          </SfButton>
        </div>
      </form>
    </SfModal>
  </div>
</template>
