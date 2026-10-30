<script lang="ts" setup>
import { SfButton, SfInput } from '@storefront-ui/vue'

type AccountFormsNameProps = {
  fullName?: string
  email?: string
  loading?: boolean
  message?: { type: 'success' | 'error', text: string } | null
}

const props = defineProps<AccountFormsNameProps>()
const { email, fullName } = toRefs(props)
const emit = defineEmits(['on-save', 'on-cancel'])
const userData = ref({
  fullName: fullName?.value ?? '',
  email: email?.value ?? '',
  subscribeNewsletter: true,
})

// Turns on once the user attempts to submit, so empty required fields go red.
const showErrors = ref(false)
const submit = () => {
  showErrors.value = true
  if (!userData.value.fullName.trim() || !userData.value.email.trim()) return
  emit('on-save', userData.value)
}
</script>

<template>
  <form
    data-testid="account-forms-name"
    novalidate
    @submit.prevent="submit"
  >
    <div class="md:flex flex-col justify-between gap-4">
      <label class="block flex-1">
        <UiFormLabel>{{ $t('contactInfo.name') }}</UiFormLabel>
        <SfInput
          v-model="userData.fullName"
          name="fullname"
          type="text"
          required
          :invalid="showErrors && !userData.fullName.trim()"
        />
      </label>
      <label class="block flex-1">
        <UiFormLabel>{{ $t('contactInfo.email') }}</UiFormLabel>
        <SfInput
          v-model="userData.email"
          name="email"
          type="email"
          required
          :invalid="showErrors && !userData.email.trim()"
        />
      </label>
    </div>
    <UiFormMessage
      v-if="message"
      :type="message.type"
      class="mt-6"
    >
      {{ message.text }}
    </UiFormMessage>
    <div class="mt-6 flex flex-col-reverse md:flex-row md:justify-end gap-4">
      <SfButton
        type="reset"
        variant="secondary"
        :disabled="loading"
        @click="$emit('on-cancel')"
      >
        {{ $t('contactInfo.cancel') }}
      </SfButton>
      <SfButton
        type="submit"
        class="min-w-[120px]"
        :disabled="loading"
      >
        {{ loading ? 'Saving…' : $t('contactInfo.save') }}
      </SfButton>
    </div>
  </form>
</template>
