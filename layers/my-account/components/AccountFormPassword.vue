<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

type AccountFormPasswordProps = {
  oldPassword?: string
  firstNewPassword?: string
  secondNewPassword?: string
  loading?: boolean
  message?: { type: 'success' | 'error', text: string } | null
}

const props = defineProps<AccountFormPasswordProps>()
const { oldPassword, firstNewPassword, secondNewPassword } = toRefs(props)
const emit = defineEmits(['on-save', 'on-cancel'])
const userPasswords = ref({
  oldPassword: oldPassword?.value ?? '',
  firstNewPassword: firstNewPassword?.value ?? '',
  secondNewPassword: secondNewPassword?.value ?? '',
})

// Turns on once the user attempts to submit, so empty required fields go red.
const showErrors = ref(false)
const submit = () => {
  showErrors.value = true
  if (
    !userPasswords.value.oldPassword.trim()
    || !userPasswords.value.firstNewPassword.trim()
    || !userPasswords.value.secondNewPassword.trim()
  ) return
  emit('on-save', userPasswords.value)
}
</script>

<template>
  <form
    data-testid="account-forms-password"
    novalidate
    @submit.prevent="submit"
  >
    <label class="block">
      <UiFormLabel>{{
        $t('account.accountSettings.personalData.currentPassword')
      }}</UiFormLabel>
      <UiFormPasswordInput
        v-model="userPasswords.oldPassword"
        name="password"
        required
        :invalid="showErrors && !userPasswords.oldPassword.trim()"
      />
    </label>
    <label class="block my-4">
      <UiFormLabel>{{
        $t('account.accountSettings.personalData.newPassword')
      }}</UiFormLabel>
      <UiFormPasswordInput
        v-model="userPasswords.firstNewPassword"
        name="password"
        required
        :invalid="showErrors && !userPasswords.firstNewPassword.trim()"
      />
    </label>
    <label class="block">
      <UiFormLabel>{{
        $t('account.accountSettings.personalData.newPasswordAgain')
      }}</UiFormLabel>
      <UiFormPasswordInput
        v-model="userPasswords.secondNewPassword"
        name="password"
        required
        :invalid="showErrors && !userPasswords.secondNewPassword.trim()"
      />
    </label>
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
        {{ loading ? 'Changing…' : $t('account.accountSettings.personalData.changePassword') }}
      </SfButton>
    </div>
  </form>
</template>
