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

const { city, country, state, street, phone, zip } = toRefs(props.savedAddress)

const countryId = toRef(country.value?.id)
const stateId = toRef(state.value?.id)

const { addAddress, updateAddress } = useAddresses()
const { countries } = useCountryList()
const { cart } = useCart()
const { loadDeliveryMethods } = useDeliveryMethod()

// The recipient name comes from the Contact Information section — we don't ask
// for it again here. `cart.order.partner.name` is the very object the contact
// form edits, so this stays in sync as the shopper types their name there.
const savedName = props.savedAddress?.name
const contactName = computed(() => {
  const n = String(cart.value?.order?.partner?.name ?? '').trim()
  return n && n !== 'Public user' ? n : ''
})
const effectiveName = computed(
  () => contactName.value || (savedName && savedName !== 'Public user' ? savedName : ''),
)

const isBilling = computed(() => props.type === AddressEnum.Billing)
// Billing defaults to "same as shipping" (checked). Shipping never offers the toggle.
const sameAsShipping = ref(isBilling.value)

const formEl = ref<HTMLElement>()
const showErrors = ref(false)

const required = computed(() => ({
  street: !String(street.value ?? '').trim(),
  phone: !String(phone.value ?? '').trim(),
  country: !countryId.value,
  state: states.value.length ? !stateId.value : false,
  city: !String(city.value ?? '').trim(),
  zip: !String(zip.value ?? '').trim(),
}))
const valid = computed(() => !Object.values(required.value).some(Boolean))

// One-page checkout: fields are always editable and save themselves on blur.
// We need the recipient name (from Contact Information) before we can save, so
// the save is also re-attempted when that name becomes available.
let lastSaved = ''
const save = async () => {
  if (!valid.value || !effectiveName.value) return
  const snap = JSON.stringify({
    name: effectiveName.value, street: street.value, city: city.value, zip: zip.value,
    phone: phone.value, countryId: countryId.value, stateId: stateId.value,
  })
  if (snap === lastSaved) return
  lastSaved = snap

  const data: UpdateAddressInput = {
    name: effectiveName.value,
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

  // The available delivery methods depend on the shipping address, so refresh
  // them now that it's saved — otherwise the Shipping Details section stays
  // stuck on "Not available until a shipping address is provided".
  if (props.type === AddressEnum.Shipping) await loadDeliveryMethods()
}

// If the address is filled in before the contact name, save it as soon as the
// name arrives.
watch(contactName, () => {
  if (valid.value) save()
})

const selectedCountry = computed<Country>(
  () => countries.value.countries?.find((item: any) => item.id === countryId.value) || ({} as Country),
)
const states = computed(() => selectedCountry.value?.states || [])

const showFields = computed(() => !isBilling.value || !sameAsShipping.value)
const sectionDone = computed(() => (isBilling.value && sameAsShipping.value) || valid.value)

// Place-Order validation: turn on red borders and return the first invalid
// field to focus (or null when the section is complete / not applicable).
const fieldOrder = [
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
        <label class="block sm:col-span-2">
          <UiFormLabel>{{ $t("form.phoneLabel") }}</UiFormLabel>
          <SfInput v-model="phone" name="phone" type="tel" autocomplete="tel" :invalid="showErrors && required.phone" />
          <UiFieldError v-if="showErrors && required.phone">{{ $t("form.fieldRequired") }}</UiFieldError>
        </label>
        <label class="block sm:col-span-2">
          <UiFormLabel>{{ $t("form.streetNameLabel") }}</UiFormLabel>
          <SfInput v-model="street" name="streetName" autocomplete="street-address" :invalid="showErrors && required.street" />
          <UiFieldError v-if="showErrors && required.street">{{ $t("form.fieldRequired") }}</UiFieldError>
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
          <UiFieldError v-if="showErrors && required.country">{{ $t("form.fieldRequired") }}</UiFieldError>
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
          <UiFieldError v-if="showErrors && required.state">{{ $t("form.fieldRequired") }}</UiFieldError>
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.cityLabel") }}</UiFormLabel>
          <SfInput v-model="city" name="city" autocomplete="address-level2" :invalid="showErrors && required.city" />
          <UiFieldError v-if="showErrors && required.city">{{ $t("form.fieldRequired") }}</UiFieldError>
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("form.postalCodeLabel") }}</UiFormLabel>
          <SfInput v-model="zip" name="postalCode" autocomplete="postal-code" :invalid="showErrors && required.zip" />
          <UiFieldError v-if="showErrors && required.zip">{{ $t("form.fieldRequired") }}</UiFieldError>
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
