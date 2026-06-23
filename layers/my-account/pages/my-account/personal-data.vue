<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

definePageMeta({
  layout: 'account',
  middleware: ['auth-check'],
})

const { loadUser, user, updatePartner, updatePassword, loading } = useAuth()

type Message = { type: 'success' | 'error', text: string }

// Which section is being edited inline ('' = none). These are plain refs, so
// they reset whenever the page is unmounted — visiting another account page and
// coming back clears any open form and message rather than leaving it lingering.
const editing = ref<'' | 'contact' | 'password'>('')
const contactMessage = ref<Message | null>(null)
const passwordMessage = ref<Message | null>(null)

// The thrown error nests the real GraphQL message somewhere under .cause/.data
// (ofetch wraps the original in `cause`). Recursively find the first meaningful
// `message` string, skipping the ofetch "[POST] … 500 Server Error" wrapper.
const isStatusNoise = (s: string) =>
  /^\[|\b500\b|server error|failed to fetch/i.test(s)
const findMessage = (obj: any, depth = 0): string => {
  if (obj == null || depth > 6) return ''
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const m = findMessage(item, depth + 1)
      if (m) return m
    }
    return ''
  }
  if (typeof obj !== 'object') return ''
  const m = obj.message
  if (typeof m === 'string' && m && !isStatusNoise(m)) return m
  return (
    findMessage(obj.data, depth + 1)
    || findMessage(obj.cause, depth + 1)
    || findMessage(obj.errors, depth + 1)
    || findMessage(obj.response?._data, depth + 1)
  )
}
const errorText = (e: any, fallback: string) => findMessage(e) || fallback

const editContact = () => {
  contactMessage.value = null
  editing.value = 'contact'
}
const editPassword = () => {
  passwordMessage.value = null
  editing.value = 'password'
}
const cancel = () => {
  if (editing.value === 'contact') contactMessage.value = null
  else if (editing.value === 'password') passwordMessage.value = null
  editing.value = ''
}

const saveContact = async (userData: any) => {
  contactMessage.value = null
  try {
    await updatePartner({
      email: userData?.email || user.value?.email,
      name: userData?.fullName || user.value?.name,
      subscribeNewsletter: userData?.subscribeNewsletter,
    })
    editing.value = ''
    contactMessage.value = { type: 'success', text: 'Your contact information has been updated.' }
  }
  catch (e) {
    contactMessage.value = { type: 'error', text: errorText(e, 'We couldn\'t update your details. Please try again.') }
  }
}

const savePassword = async (passwords: any) => {
  passwordMessage.value = null
  if (passwords.firstNewPassword !== passwords.secondNewPassword) {
    passwordMessage.value = { type: 'error', text: 'The new passwords don\'t match.' }
    return
  }
  try {
    await updatePassword({
      currentPassword: passwords.oldPassword,
      newPassword: passwords.firstNewPassword,
    })
    editing.value = ''
    passwordMessage.value = { type: 'success', text: 'Your password has been changed.' }
  }
  catch (e) {
    passwordMessage.value = { type: 'error', text: errorText(e, 'We couldn\'t change your password. Check your current password and try again.') }
  }
}

onMounted(async () => {
  await loadUser(true)
})
</script>

<template>
  <div class="col-span-full max-w-[640px]">
    <!-- Contact information -->
    <section>
      <div class="flex items-start justify-between gap-4">
        <h2 class="typography-headline-4 font-bold">
          {{ $t('account.accountSettings.personalData.contactInformation') }}
        </h2>
        <SfButton
          v-if="editing !== 'contact'"
          variant="tertiary"
          size="sm"
          @click="editContact"
        >
          {{ $t('account.accountSettings.personalData.edit') }}
        </SfButton>
      </div>

      <p
        v-if="contactMessage && editing !== 'contact'"
        role="alert"
        class="mt-3 border text-[13px] px-3 py-2.5"
        :class="contactMessage.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'"
      >
        {{ contactMessage.text }}
      </p>

      <dl
        v-if="editing !== 'contact'"
        class="mt-4 space-y-4"
      >
        <div>
          <dt class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-0.5">
            {{ $t('contactInfo.name') }}
          </dt>
          <dd class="text-primary-800">{{ user?.name || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-0.5">
            {{ $t('contactInfo.email') }}
          </dt>
          <dd class="text-primary-800">{{ user?.email || '—' }}</dd>
        </div>
      </dl>
      <AccountContactInformation
        v-else
        class="mt-4"
        :full-name="user?.name"
        :email="user?.email"
        :loading="loading"
        :message="contactMessage"
        @on-save="saveContact"
        @on-cancel="cancel"
      />
    </section>

    <UiDivider class="my-8" />

    <!-- Password -->
    <section>
      <div class="flex items-start justify-between gap-4">
        <h2 class="typography-headline-4 font-bold">
          {{ $t('account.accountSettings.personalData.yourPassword') }}
        </h2>
        <SfButton
          v-if="editing !== 'password'"
          variant="tertiary"
          size="sm"
          @click="editPassword"
        >
          {{ $t('account.accountSettings.personalData.change') }}
        </SfButton>
      </div>

      <p
        v-if="passwordMessage && editing !== 'password'"
        role="alert"
        class="mt-3 border text-[13px] px-3 py-2.5"
        :class="passwordMessage.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'"
      >
        {{ passwordMessage.text }}
      </p>

      <p
        v-if="editing !== 'password'"
        class="mt-3 text-primary-400 tracking-[0.3em] select-none"
      >
        ••••••••
      </p>
      <AccountFormPassword
        v-else
        class="mt-4"
        :loading="loading"
        :message="passwordMessage"
        @on-save="savePassword"
        @on-cancel="cancel"
      />
    </section>
  </div>
</template>
