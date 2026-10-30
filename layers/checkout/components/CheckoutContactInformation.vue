<script lang="ts" setup>
import { SfInput } from '@storefront-ui/vue'
import type { Partner } from '~~/graphql'
import { isValidEmail } from '~~/app/utils/validation'

const { updatePartner } = useAuth()

const props = defineProps({
  heading: { type: String, required: true },
  step: { type: [String, Number], default: '' },
  partnerData: { type: Object as PropType<Partner>, required: true },
})

const { email, name } = toRefs(props.partnerData)
if (name.value === 'Public user' || (props.partnerData.isPublic && props.partnerData.id === 4)) {
  name.value = ''
}

const formEl = ref<HTMLElement>()
const showErrors = ref(false)
const nameInvalid = computed(() => !String(name.value ?? '').trim())
const emailEmpty = computed(() => !String(email.value ?? '').trim())
const emailInvalid = computed(() => !isValidEmail(String(email.value ?? '')))
const valid = computed(() => !nameInvalid.value && !emailInvalid.value)

// One-page checkout: fields are always editable and save themselves on blur
// once valid (email must be a real address). No Edit/Save round-trip.
let lastSaved = ''
const save = async () => {
  if (!valid.value) return
  const snap = `${name.value}|${email.value}`
  if (snap === lastSaved) return
  lastSaved = snap
  try {
    await updatePartner({
      email: String(email.value),
      name: String(name.value),
      // The resolver only writes a phone when one is given; null leaves it as is.
      phone: null,
      subscribeNewsletter: true,
    })
  }
  catch {
    lastSaved = ''
  }
}

// Called by the page when the shopper presses Place Order. Turns on the red
// borders and returns the first invalid field to focus (or null if valid).
defineExpose({
  validate(): HTMLElement | null {
    showErrors.value = true
    if (valid.value) return null
    const target = nameInvalid.value ? 'name' : 'email'
    return formEl.value?.querySelector<HTMLElement>(`[name="${target}"]`) ?? null
  },
})
</script>

<template>
  <section
    class="py-7"
    data-testid="checkout-contact"
  >
    <CheckoutStepHeading
      :step="step"
      :heading="heading"
      :done="valid"
      :invalid="showErrors"
    />

    <div class="md:pl-[38px]">
      <div
        ref="formEl"
        class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 max-w-[640px]"
        @focusout="save"
      >
        <label class="block">
          <UiFormLabel>{{ $t("contactInfo.name") }}</UiFormLabel>
          <SfInput
            :model-value="name ?? undefined"
            name="name"
            type="text"
            :invalid="showErrors && nameInvalid"
            @update:model-value="name = String($event)"
          />
          <UiFieldError v-if="showErrors && nameInvalid">{{ $t("form.fieldRequired") }}</UiFieldError>
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("contactInfo.email") }}</UiFormLabel>
          <SfInput
            :model-value="email ?? undefined"
            name="email"
            type="email"
            :invalid="showErrors && emailInvalid"
            @update:model-value="email = String($event)"
          />
          <UiFieldError v-if="showErrors && emailInvalid">
            {{ emailEmpty ? $t("form.fieldRequired") : $t("form.invalidEmail") }}
          </UiFieldError>
        </label>
      </div>
    </div>
  </section>
</template>
