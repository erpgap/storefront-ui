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
    <div class="flex items-center gap-3 mb-5">
      <span
        v-if="step"
        :class="[
          'w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] shrink-0',
          valid ? 'bg-black text-white'
          : showErrors ? 'border border-red-300 text-red-600'
          : 'border border-primary-200 text-primary-500',
        ]"
      >
        <template v-if="valid">✓</template>
        <template v-else>{{ step }}</template>
      </span>
      <h2 class="text-[13px] tracking-[0.14em] uppercase font-semibold">
        {{ heading }}
      </h2>
    </div>

    <div class="md:pl-[38px]">
      <div
        ref="formEl"
        class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 max-w-[640px]"
        @focusout="save"
      >
        <label class="block">
          <UiFormLabel>{{ $t("contactInfo.name") }}</UiFormLabel>
          <SfInput v-model="name" name="name" type="text" :invalid="showErrors && nameInvalid" />
        </label>
        <label class="block">
          <UiFormLabel>{{ $t("contactInfo.email") }}</UiFormLabel>
          <SfInput v-model="email" name="email" type="email" :invalid="showErrors && emailInvalid" />
        </label>
      </div>
    </div>
  </section>
</template>
