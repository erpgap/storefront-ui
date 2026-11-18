<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

// Built like the shop's login (layers/auth/pages/login.vue), from the same
// form components, so the two read as one product.
// Editors sign in with their Odoo account. Separate from the customer login so
// the two session types stay conceptually distinct.
definePageMeta({ layout: false })
const { t } = useI18n()
const cmsText = useCmsText()
useHead({ title: () => t('cmsEditor.login.pageTitle') })

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

const route = useRoute()

async function submit() {
  error.value = ''
  busy.value = true

  try {
    await $fetch('/api/cms/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo(String(route.query.next || '/cms'), { external: true })
  }
  catch (e: any) {
    // A bare status with no message is almost always the backend being
    // unreachable, which is worth saying rather than "Could not sign in".
    error.value = cmsText.errorMessage(e, e?.statusCode >= 500
      ? t('cmsEditor.login.notResponding')
      : t('cmsEditor.login.failed'))
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-white text-black px-4 pt-16 pb-20 md:pt-24">
    <div class="mx-auto max-w-[630px]">
      <h1 class="font-bold typography-headline-3 md:typography-headline-2">
        {{ $t('cmsEditor.login.heading') }}
      </h1>
      <p class="mt-2 mb-10 text-primary-600">
        {{ $t('cmsEditor.tagline') }}
      </p>

      <form
        method="post"
        class="flex flex-col gap-5 border border-primary-100 p-6 md:p-8"
        @submit.prevent="submit"
      >
        <label>
          <UiFormLabel>{{ $t('cmsEditor.login.email') }}</UiFormLabel>
          <!-- Text, not email: an Odoo login need not be an address. -->
          <SfInput
            v-model="email"
            name="email"
            type="text"
            autocomplete="username"
            required
          />
        </label>

        <label>
          <UiFormLabel>{{ $t('cmsEditor.login.password') }}</UiFormLabel>
          <UiFormPasswordInput
            v-model="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </label>

        <UiFormMessage v-if="error">
          {{ error }}
        </UiFormMessage>

        <SfButton
          type="submit"
          class="mt-2"
          :disabled="busy"
        >
          {{ busy ? $t('cmsEditor.login.submitting') : $t('cmsEditor.login.submit') }}
        </SfButton>
      </form>
    </div>
  </main>
</template>
