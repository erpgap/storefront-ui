<script setup lang="ts">
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
  <div class="min-h-screen grid place-items-center bg-primary-50 text-black px-4">
    <form
      method="post"
      class="w-full max-w-sm bg-white rounded-lg border border-primary-200 p-6 flex flex-col gap-4"
      @submit.prevent="submit"
    >
      <div>
        <h1 class="text-[15px] font-medium">
          {{ $t('cmsEditor.brand') }}
        </h1>
        <p class="text-[12px] text-primary-400 mt-0.5">
          {{ $t('cmsEditor.tagline') }}
        </p>
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">{{ $t('cmsEditor.login.email') }}</span>
        <input
          v-model="email"
          type="text"
          autocomplete="username"
          required
          class="editor-input"
        >
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">{{ $t('cmsEditor.login.password') }}</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="editor-input"
        >
      </label>

      <CmsEditorError v-if="error">
        {{ error }}
      </CmsEditorError>

      <button
        type="submit"
        class="px-4 py-2.5 text-[12px] tracking-[0.08em] uppercase text-white bg-black rounded-sm disabled:opacity-50"
        :disabled="busy"
      >
        {{ busy ? $t('cmsEditor.login.submitting') : $t('cmsEditor.login.submit') }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.editor-input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  font-size: 14px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 0.25rem;
}

.editor-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}
</style>
