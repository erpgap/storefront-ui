<script lang="ts" setup>
import { SfButton, SfInput, SfIconVisibility } from '@storefront-ui/vue'

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

const passwordVisible = ref(false)
const firstNewPasswordVisible = ref(false)
const secondNewPasswordVisible = ref(false)

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
      <SfInput
        v-model="userPasswords.oldPassword"
        name="password"
        :type="passwordVisible ? 'text' : 'password'"
        required
        :invalid="showErrors && !userPasswords.oldPassword.trim()"
      >
        <template #suffix>
          <button
            type="button"
            @click="passwordVisible = !passwordVisible"
          >
            <SfIconVisibility />
          </button>
        </template>
      </SfInput>
    </label>
    <label class="block my-4">
      <UiFormLabel>{{
        $t('account.accountSettings.personalData.newPassword')
      }}</UiFormLabel>
      <SfInput
        v-model="userPasswords.firstNewPassword"
        name="password"
        :type="firstNewPasswordVisible ? 'text' : 'password'"
        required
        :invalid="showErrors && !userPasswords.firstNewPassword.trim()"
      >
        <template #suffix>
          <button
            type="button"
            @click="firstNewPasswordVisible = !firstNewPasswordVisible"
          >
            <SfIconVisibility />
          </button>
        </template>
      </SfInput>
    </label>
    <label class="block">
      <UiFormLabel>{{
        $t('account.accountSettings.personalData.newPasswordAgain')
      }}</UiFormLabel>
      <SfInput
        v-model="userPasswords.secondNewPassword"
        name="password"
        :type="secondNewPasswordVisible ? 'text' : 'password'"
        required
        :invalid="showErrors && !userPasswords.secondNewPassword.trim()"
      >
        <template #suffix>
          <button
            type="button"
            @click="secondNewPasswordVisible = !secondNewPasswordVisible"
          >
            <SfIconVisibility />
          </button>
        </template>
      </SfInput>
    </label>
    <p
      v-if="message"
      role="alert"
      class="mt-6 border text-[13px] px-3 py-2.5"
      :class="message.type === 'success'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-red-200 bg-red-50 text-red-700'"
    >
      {{ message.text }}
    </p>
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
