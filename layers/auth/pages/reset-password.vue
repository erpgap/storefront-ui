<template>
  <div>
    <NuxtLayout
      name="auth"
      :heading="$t('auth.resetPassword.heading')"
    >
      <form
        class="mt-10 border border-primary-100 p-6 md:p-8"
        @submit.prevent="resetPasswordHandler"
      >
        <p class="mb-6">
          {{ $t("auth.resetPassword.info") }}
        </p>

        <label>
          <UiFormLabel>{{ $t("auth.resetPassword.email") }}</UiFormLabel>
          <SfInput
            v-model="customerEmail"
            name="email"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <!-- What came of the request: the link sent, or why not. -->
        <UiFormMessage
          v-if="status"
          :type="status.type"
          class="mt-5"
        >
          {{ status.text }}
        </UiFormMessage>

        <div class="mt-6 flex flex-col gap-3">
          <SfButton
            type="submit"
            :disabled="isSubmitting || !customerEmail"
          >
            {{ isSubmitting ? $t("auth.resetPassword.sending") : $t("auth.resetPassword.continue") }}
          </SfButton>

          <SfButton
            :tag="NuxtLink"
            to="/login"
            class="text-base!"
            variant="tertiary"
            :disabled="isSubmitting"
          >
            {{ $t("auth.resetPassword.backToLogin") }}
          </SfButton>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

definePageMeta({ layout: false })

const NuxtLink = resolveComponent('NuxtLink')
const customerEmail = ref('')
const isSubmitting = ref(false)

const { resetPassword } = useAuth()
const { t } = useI18n()
const status = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function resetPasswordWithRetry(email: string, max = 3) {
  for (let i = 0; i < max; i++) {
    try {
      await resetPassword({ email })
      return
    }
    catch (e: any) {
      // Two requests updating the same user at once make Postgres refuse one
      // of them; it succeeds when sent again after a short pause.
      if (
        errorMessage(e).toLowerCase().includes('could not serialize access due to concurrent update')
        && i < max - 1
      ) {
        await new Promise(r => setTimeout(r, 300 + i * 200))
        continue
      }

      throw e
    }
  }
}

async function resetPasswordHandler() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  status.value = null
  try {
    await resetPasswordWithRetry(customerEmail.value)
    status.value = { type: 'success', text: t('auth.resetPassword.linkSent') }
  }
  catch (e: any) {
    const raw = errorMessage(e, t('auth.resetPassword.serverError'))

    // The mail server's sending limit (Mailtrap's, in testing) reads better
    // in our words than in its own.
    let text = raw
    if (raw.includes('Too many emails per second')) {
      text = t('auth.resetPassword.rateLimited')
    }
    else if (raw.toLowerCase().includes('invalid email')) {
      text = t('auth.resetPassword.invalidEmail')
    }
    // Odoo could not reach its mail server. Its message is a Python tuple
    // naming the exception, which means nothing to a shopper.
    else if (/smtp|mail server|connection refused/i.test(raw)) {
      text = t('auth.resetPassword.sendFailed')
    }
    status.value = { type: 'error', text }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
