<script lang="ts" setup>
import { SfCheckbox, SfInput, SfSelect } from '@storefront-ui/vue'
import type { PropType } from 'vue'
import {
  AddressEnum,
  type AddAddressInput,
  type Country,
  type Partner,
  type State,
  type UpdateAddressInput,
} from '~~/graphql'

const props = defineProps({
  heading: String,
  description: String,
  buttonText: String,
  step: { type: [String, Number], default: '' },
  type: {
    type: String as PropType<AddressEnum>,
    required: true,
  },
  savedAddress: {
    type: Object as PropType<Partner>,
    default: () => ({}),
  },
})

const { city, country, name, state, street, phone, zip } = toRefs(props.savedAddress)
name.value = name.value === 'Public user' ? '' : name.value

const countryId = toRef(country.value?.id)
const stateId = toRef(state.value?.id)

const { addAddress, updateAddress } = useAddresses()
const { countries } = useCountryList()

const isBilling = computed(() => props.type === AddressEnum.Billing)
// Billing defaults to "same as shipping" (checked). Shipping never offers the toggle.
const sameAsShipping = ref(isBilling.value)

const formEl = ref<HTMLElement>()
const showErrors = ref(false)

const required = computed(() => ({
  name: !String(name.value ?? '').trim(),
  street: !String(street.value ?? '').trim(),
  phone: !String(phone.value ?? '').trim(),
  country: !countryId.value,
  state: states.value.length ? !stateId.value : false,
  city: !String(city.value ?? '').trim(),
  zip: !String(zip.value ?? '').trim(),
}))
const valid = computed(() => !Object.values(required.value).some(Boolean))

// One-page checkout: fields are always editable and save themselves on blur.
let lastSaved = ''
const save = async () => {
  if (!valid.value) return
  const snap = JSON.stringify({
    name: name.value, street: street.value, city: city.value, zip: zip.value,
    phone: phone.value, countryId: countryId.value, stateId: stateId.value,
  })
  if (snap === lastSaved) return
  lastSaved = snap

  const data: UpdateAddressInput = {
    name: name.value,
    street: street.value?.split(' ')?.[0],
    street2: street.value?.split(' ')?.[1],
    city: city.value,
    zip: zip.value,
    phone: phone.value,
    countryId: Number(countryId.value),
    stateId: Number(stateId.value),
  }

  if (props.savedAddress?.id && props.savedAddress.id !== 4) {
    data.id = props.savedAddress.id
    await updateAddress(data, props.type)
  }
  else {
    await addAddress(data as unknown as AddAddressInput, props.type)
  }
}

const selectedCountry = computed<Country>(
  () => countries.value.countries?.find((item: any) => item.id === countryId.value) || ({} as Country),
)
const states = computed(() => selectedCountry.value?.states || [])

const showFields = computed(() => !isBilling.value || !sameAsShipping.value)
const sectionDone = computed(() => (isBilling.value && sameAsShipping.value) || valid.value)

// Place-Order validation: turn on red borders and return the first invalid
// field to focus (or null when the section is complete / not applicable).
const fieldOrder = [
  { key: 'name', name: 'name' },
  { key: 'phone', name: 'phone' },
  { key: 'street', name: 'streetName' },
  { key: 'country', name: 'country' },
  { key: 'state', name: 'state' },
  { key: 'city', name: 'city' },
  { key: 'zip', name: 'postalCode' },
] as const
defineExpose({
  validate(): HTMLElement | null {
    if (isBilling.value && sameAsShipping.value) return null
    showErrors.value = true
    if (valid.value) return null
    const first = fieldOrder.find(f => (required.value as any)[f.key])
    return first ? formEl.value?.querySelector<HTMLElement>(`[name="${first.name}"]`) ?? null : null
  },
})
</script>

<template>
  <section
    class="py-7"
    data-testid="checkout-address"
  >
    <div class="flex items-center gap-3 mb-5">
      <span
        v-if="step"
        :class="[
          'w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] shrink-0',
          sectionDone ? 'bg-black text-white'
          : showErrors ? 'border border-red-300 text-red-600'
          : 'border border-primary-200 text-primary-500',
        ]"
      >
        <template v-if="sectionDone">✓</template>
        <template v-else>{{ step }}</template>
      </span>
      <h2 class="text-[13px] tracking-[0.14em] uppercase font-semibold">
        {{ heading }}
      </h2>
    </div>

    <div class="md:pl-[38px]">
      <label
        v-if="isBilling"
        class="flex items-center gap-2.5 text-[14px] text-primary-700 cursor-pointer"
        :class="{ 'mb-5': showFields }"
      >
        <SfCheckbox v-model="sameAsShipping" />
        {{ $t("form.sameAsShipping") }}
      </label>

      <div
        v-if="showFields"
        ref="formEl"
        class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 max-w-[640px]"
        @focusout="save"
      >
        <label class="block">
          <UiFormLabel>{{ $t("form.NameLabel") }}</UiFormLabel>
          <SfInput v-model="name" name="name" autocomplete="name" :invalid="showErrors && required.name" />
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.phoneLabel") }}</UiFormLabel>
          <SfInput v-model="phone" name="phone" type="tel" autocomplete="tel" :invalid="showErrors && required.phone" />
        </label>
        <label class="block sm:col-span-2">
          <UiFormLabel>{{ $t("form.streetNameLabel") }}</UiFormLabel>
          <SfInput v-model="street" name="streetName" autocomplete="street-address" :invalid="showErrors && required.street" />
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.countryLabel") }}</UiFormLabel>
          <SfSelect v-model="countryId" name="country" autocomplete="country-name" :invalid="showErrors && required.country">
            <option key="placeholder" :value="null">
              {{ $t("form.selectPlaceholder") }}
            </option>
            <option v-for="countryOption in countries.countries" :key="countryOption?.id" :value="countryOption?.id">
              {{ countryOption?.name }}
            </option>
          </SfSelect>
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.stateLabel") }}</UiFormLabel>
          <SfSelect v-model="stateId" name="state" autocomplete="address-level1" :disabled="!states.length" :invalid="showErrors && required.state">
            <option key="placeholder" :value="null">
              {{ $t("form.selectPlaceholder") }}
            </option>
            <option v-for="stateOption in states" :key="stateOption.id" :value="stateOption.id">
              {{ stateOption.name }}
            </option>
          </SfSelect>
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.cityLabel") }}</UiFormLabel>
          <SfInput v-model="city" name="city" autocomplete="address-level2" :invalid="showErrors && required.city" />
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.postalCodeLabel") }}</UiFormLabel>
          <SfInput v-model="zip" name="postalCode" autocomplete="postal-code" :invalid="showErrors && required.zip" />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* A native <select> can't reliably reflect its open state (the OS popup blocks
   the control's repaint), so rotate the chevron while the field is focused. */
:deep([data-testid="select"]:focus-within svg) {
  transform: rotate(180deg);
}
</style>
