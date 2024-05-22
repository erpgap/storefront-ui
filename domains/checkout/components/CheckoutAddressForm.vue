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
} from "@storefront-ui/vue";
import type { PropType } from "vue";
import {
  AddressEnum,
  AddressType,
  type AddAddressInput,
  type Country,
  type Partner,
  type State,
  type UpdateAddressInput,
} from "~/graphql";

const props = defineProps({
  heading: String,
  description: String,
  buttonText: String,
  type: String,
  savedAddress: {
    type: Object as PropType<Partner>,
    default: () => {},
  },
});

const { city, country, email, name, phone, state, street, street2, zip } =
  toRefs(props.savedAddress);
const countryId = toRef(country.value?.id);
const stateId = toRef(state.value?.id);

const { isOpen, open, close } = useDisclosure();
const { addAddress, updateAddress } = useAddresses();
const { countries } = useCountry();

const isCartUpdateLoading = false;

const handleSaveAddress = async () => {
  const data = {
    name: name.value,
    street: street.value?.split(" ")?.[0],
    street2: street.value?.split(" ")?.[1],
    city: city.value,
    zip: zip.value,
    phone: phone.value,
    countryId: countryId.value,
    stateId: stateId.value,
  };
  const type =
    props.savedAddress.addressType === AddressType.InvoiceAddress
      ? AddressEnum.Billing
      : AddressEnum.Shipping;

  if (props.savedAddress?.id) {
    await updateAddress(
      { ...data, id: props.savedAddress.id } as unknown as UpdateAddressInput,
      type
    );
    return close();
  }

  await addAddress(data as unknown as AddAddressInput, type);
  close();
};

const selectedCountry = computed<Country>(
  () =>
    countries.value.find((item: any) => item.id === countryId.value) ||
    ({} as Country)
);

const selectedState = computed<State>(
  () =>
    selectedCountry.value?.states?.find(
      (item: any) => item.id === stateId.value
    ) || ({} as State)
);

const states = computed(() => selectedCountry.value?.states || []);
</script>

<template>
  <div data-testid="checkout-address" class="md:px-4 py-6">
    <div class="flex justify-between items-center">
      <h2 class="text-neutral-900 text-lg font-bold mb-4">
        {{ props.heading }}
      </h2>
      <SfButton size="sm" variant="tertiary" @click="open">
        {{ savedAddress.id ? $t("contactInfo.edit") : $t("contactInfo.add") }}
      </SfButton>
    </div>

    <div v-if="savedAddress.id" class="mt-2 md:w-[520px]">
      <p>{{ `${name}, ${street}` }}</p>
      <p>{{ phone }}</p>
      <p>{{ selectedCountry.name }}</p>
      <p>{{ selectedState.name }}</p>
      <p>{{ `${city} ${zip}` }}</p>
    </div>

    <div v-if="!savedAddress" class="w-full md:max-w-[520px]">
      <p>{{ props.description }}</p>
      <SfButton class="mt-4 w-full md:w-auto" variant="secondary" @click="open">
        {{ props.buttonText }}
      </SfButton>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-10"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-10"
    >
      <SfModal
        v-model="isOpen"
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
            {{ heading }}
          </h3>
        </header>
        <form
          class="grid grid-cols-1 md:grid-cols-[50%_1fr_120px] gap-4"
          data-testid="address-form"
          @submit.prevent="handleSaveAddress"
        >
          <label>
            <UiFormLabel>{{ $t("form.NameLabel") }}</UiFormLabel>
            <SfInput
              v-model="name"
              name="name"
              autocomplete="given-name"
              required
              :placeholder="$t('form.NameLabel')"
            />
          </label>
          <label class="md:col-span-2">
            <UiFormLabel>{{ $t("form.streetNameLabel") }}</UiFormLabel>
            <SfInput
              v-model="street"
              name="streetName"
              autocomplete="family-name"
              required
              :placeholder="$t('form.streetNameLabel')"
            />
          </label>
          <label class="md:col-span-3">
            <UiFormLabel>{{ $t("form.phoneLabel") }}</UiFormLabel>
            <SfInput
              v-model="phone"
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
              v-model="countryId"
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
              v-model="stateId"
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
              v-model="city"
              name="city"
              autocomplete="address-level2"
              required
              :placeholder="$t('form.cityLabel')"
            />
          </label>
          <label>
            <UiFormLabel>{{ $t("form.postalCodeLabel") }}</UiFormLabel>
            <SfInput
              v-model="zip"
              name="postalCode"
              autocomplete="postal-code"
              required
              :placeholder="$t('form.postalCodeLabel')"
            />
          </label>

          <label
            v-if="props.type === 'billingAddress'"
            class="md:col-span-3 flex items-center gap-2"
          >
            <SfCheckbox name="useAsShipping" />
            {{ $t("form.useAsShippingLabel") }}
          </label>

          <div
            class="md:col-span-3 flex flex-col-reverse md:flex-row justify-end mt-6 gap-4"
          >
            <SfButton type="reset" class="" variant="secondary" @click="close">
              {{ $t("contactInfo.cancel") }}
            </SfButton>
            <SfButton
              type="submit"
              class="min-w-[120px]"
              :disabled="isCartUpdateLoading"
            >
              <SfLoaderCircular
                v-if="isCartUpdateLoading"
                class="flex justify-center items-center"
                size="sm"
              />
              <span v-else>
                {{ $t("contactInfo.save") }}
              </span>
            </SfButton>
          </div>
        </form>
      </SfModal>
    </transition>
    <div
      v-if="isOpen"
      class="fixed !w-screen !h-screen inset-0 bg-neutral-500 bg-opacity-50 transition-opacity duration-1000 top-index"
    />
  </div>
</template>
