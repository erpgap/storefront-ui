<template>
  <div>
    <NuxtLayout name="auth" :heading="$t('auth.resetPassword.heading')">
      <form
        class="pb-4 md:p-6 mt-10 md:border md:border-neutral-200 rounded-md"
        @submit.prevent="resetPasswordHandler"
      >
        <p class="mb-6">
          {{ $t("auth.resetPassword.info") }}
        </p>

        <label>
          <FormLabel>{{ $t("auth.resetPassword.email") }}</FormLabel>
          <SfInput
            v-model="customerEmail"
            name="email"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <div class="mt-6 flex flex-col-reverse md:flex-row gap-4">
          <SfButton
            :tag="NuxtLink"
            to="/login"
            class="flex-1"
            variant="tertiary"
            :disabled="isSubmitting"
          >
            {{ $t("auth.resetPassword.backToLogin") }}
          </SfButton>

          <SfButton
            type="submit"
            class="flex-1"
            :disabled="isSubmitting || !customerEmail"
          >
            <template v-if="isSubmitting">
              <SfLoaderCircular size="base" class="mx-auto" />
            </template>
            <template v-else>
              {{ $t("auth.resetPassword.continue") }}
            </template>
          </SfButton>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { SfButton, SfInput, SfLoaderCircular } from '@storefront-ui/vue'
import { useToast } from 'vue-toastification'

definePageMeta({ layout: false })

const NuxtLink = resolveComponent('NuxtLink')
const customerEmail = ref('')
const isSubmitting = ref(false)

const { resetPassword } = useAuth()
const toast = useToast?.() // se tiver um plugin de toast; senão troque por sua UI

async function resetPasswordWithRetry(email: string, max = 3) {
  for (let i = 0; i < max; i++) {
    try {
      await resetPassword({ email })
      return
    } catch (e: any) {
      const msg: string = resetPassword
        e?.response?._data?.message || e?.message || ''

      // erro de concorrência do Postgres (serialize)
      if (
        msg.toLowerCase().includes('could not serialize access due to concurrent update') &&
        i < max - 1
      ) {
        // pequeno backoff e tenta de novo
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
  try {
    await resetPasswordWithRetry(customerEmail.value)

    // sucesso
    if (toast) toast.success('We sent you a reset link (check your inbox).')
  } catch (e: any) {
    const raw = e?.response?._data?.message || e?.message || 'Server error'

    // mensagem amigável para limite do SMTP (Mailtrap Testing)
    if (raw.includes('Too many emails per second')) {
      if (toast) {
        toast.error('Email server rate-limited. Try again in a moment or use MailHog locally.')
      }
    } else if (raw.toLowerCase().includes('invalid email')) {
      if (toast) toast.error('Invalid email.')
    } else {
      if (toast) toast.error(raw)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
