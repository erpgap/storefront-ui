<script setup lang="ts">
import {
  SfButton,
  SfLink,
  SfCheckbox,
  SfInput,
  SfLoaderCircular,
} from '@storefront-ui/vue'

definePageMeta({
  layout: false,
})

const { login, loading, authError } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref<boolean>()

const handleLogin = async () => {
  await login({ email: email.value, password: password.value })
}

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <NuxtLayout name="auth" :heading="$t('auth.login.heading')">
    <form class="flex flex-col gap-5 border border-primary-100 p-6 md:p-8" @submit.prevent="handleLogin">
      <p
        v-if="authError"
        class="flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 text-[13px] px-3 py-2.5"
        role="alert"
      >
        {{ authError }}
      </p>

      <label>
        <UiFormLabel>{{ $t("form.emailLabel") }}</UiFormLabel>
        <SfInput v-model="email" name="email" type="email" autocomplete="email" required />
      </label>

      <label>
        <UiFormLabel>{{ $t("form.passwordLabel") }}</UiFormLabel>
        <UiFormPasswordInput v-model="password" name="password" autocomplete="current-password" required />
      </label>

      <label class="mt-2 flex items-center gap-2">
        <SfCheckbox v-model="rememberMe" name="rememberMe" />
        {{ $t("auth.login.rememberMeLabel") }}
      </label>

      <SfButton type="submit" class="mt-2" :disabled="loading">
        <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="base" />
        <span v-else>
          {{ $t("auth.login.submitLabel") }}
        </span>
      </SfButton>
      <SfButton :tag="NuxtLink" to="/reset-password" variant="tertiary" data-testid="login-page-reset-button">
        {{ $t("auth.login.forgotPasswordLabel") }}
      </SfButton>
    </form>

    <UiAlert class="mt-6 w-full p-4 md:p-6 !justify-start typography-text-base !bg-[#f7f7f7]" variant="neutral">
      <i18n-t tag="span" keypath="auth.login.createAccountBanner">
        <SfLink :tag="NuxtLink" to="signup" variant="primary" data-testid="login-page-signup-button">
          {{ $t("auth.login.createAccountLinkLabel") }}
        </SfLink>
      </i18n-t>
    </UiAlert>

  </NuxtLayout>
</template>
