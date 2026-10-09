<script setup lang="ts">
import {
  SfButton,
  SfLink,
  SfCheckbox,
  SfInput,
} from '@storefront-ui/vue'
import { isValidEmail } from '~~/app/utils/validation'
import { safeRedirect } from '~~/app/utils/authRedirect'

definePageMeta({
  layout: false,
})

const { login, loading, authError } = useAuth()
const route = useRoute()

// Set by the auth guard when a session the user thought they had is gone.
const sessionExpired = computed(() => route.query.expired === '1')

const redirectTo = computed(() => safeRedirect(route.query.redirect))

const email = ref('')
const password = ref('')
const rememberMe = ref<boolean>()
// Turns on once the user attempts to submit, so empty required fields go red.
const showErrors = ref(false)
const emailValid = computed(() => isValidEmail(email.value))

const handleLogin = async () => {
  showErrors.value = true
  if (!emailValid.value || !password.value.trim()) return
  await login({ email: email.value, password: password.value }, redirectTo.value)
}

// Clear any error carried over from another auth page (shared global state).
onMounted(() => {
  authError.value = ''
})

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <NuxtLayout name="auth" :heading="$t('auth.login.heading')">
    <p
      v-if="sessionExpired && !authError"
      role="status"
      data-testid="login-page-session-expired"
      class="mb-5 border border-amber-200 bg-amber-50 text-amber-800 text-[13px] px-3 py-2.5"
    >
      {{ $t("auth.login.sessionExpired") }}
    </p>

    <form novalidate class="flex flex-col gap-5 border border-primary-100 p-6 md:p-8" @submit.prevent="handleLogin">
      <label>
        <UiFormLabel>{{ $t("form.emailLabel") }}</UiFormLabel>
        <SfInput v-model="email" name="email" type="email" autocomplete="email" :invalid="showErrors && !emailValid" />
      </label>

      <label>
        <UiFormLabel>{{ $t("form.passwordLabel") }}</UiFormLabel>
        <UiFormPasswordInput v-model="password" name="password" autocomplete="current-password" :invalid="showErrors && !password.trim()" />
      </label>

      <label class="mt-2 flex items-center gap-2">
        <SfCheckbox v-model="rememberMe" name="rememberMe" />
        {{ $t("auth.login.rememberMeLabel") }}
      </label>

      <UiFormError v-if="authError">
        {{ authError }}
      </UiFormError>

      <SfButton type="submit" class="mt-2" :disabled="loading">
        {{ loading ? 'Signing in…' : $t("auth.login.submitLabel") }}
      </SfButton>
      <SfButton :tag="NuxtLink" to="/reset-password" variant="tertiary" data-testid="login-page-reset-button">
        {{ $t("auth.login.forgotPasswordLabel") }}
      </SfButton>
    </form>

    <UiAlert class="mt-6 w-full p-4 md:p-6 !justify-start typography-text-base !bg-[#f7f7f7]" variant="neutral">
      <i18n-t scope="global" tag="span" keypath="auth.login.createAccountBanner">
        <SfLink :tag="NuxtLink" to="signup" variant="primary" data-testid="login-page-signup-button">
          {{ $t("auth.login.createAccountLinkLabel") }}
        </SfLink>
      </i18n-t>
    </UiAlert>

  </NuxtLayout>
</template>
