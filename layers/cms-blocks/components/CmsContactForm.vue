<script setup lang="ts">
// The `contactForm` block: contact details next to a message form. The form
// posts to Odoo through the same `contactUs` mutation the old contact page
// used; only the details beside it are content.
import { SfInput, SfTextarea, SfButton, SfIconCheckCircle } from '@storefront-ui/vue'
import { spacingClass, type BlockSpacing } from '../utils/spacing'
import { isValidEmail } from '~~/app/utils/validation'

// No default for title in withDefaults: it is translated, so it is filled in
// below. Only a missing prop gets the default; an empty string stays empty.
const props = withDefaults(defineProps<{
  title?: string
  spacing?: BlockSpacing
  channels?: { label: string, value: string, link?: string }[]
}>(), {
  spacing: 'normal',
  channels: () => [],
})

const { t } = useI18n()
const titleText = computed(() => props.title ?? t('cms.contactForm.defaultTitle'))

const { contactUs, loading, apiError } = useCore()

const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const sent = ref(false)
// Turns on once the user attempts to submit, so empty required fields go red.
const showErrors = ref(false)

const emailValid = computed(() => isValidEmail(form.email))

const isComplete = () =>
  !!form.name.trim() && emailValid.value && !!form.phone.trim()
  && !!form.subject.trim() && !!form.message.trim()

const submit = async () => {
  showErrors.value = true
  if (!isComplete()) return

  // This form has no company field and no attachments.
  const ok = await contactUs({ contactus: { ...form, company: null, attachments: null } })
  if (ok) sent.value = true
}

const reset = () => {
  Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '' })
  apiError.value = ''
  showErrors.value = false
  sent.value = false
}
</script>

<template>
  <section
    class="narrow-container"
    :class="spacingClass(spacing)"
  >
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">
      <div>
        <h2
          v-if="titleText"
          class="text-[24px] font-light tracking-[-0.01em] mb-8"
        >
          {{ titleText }}
        </h2>
        <dl class="space-y-6">
          <div
            v-for="channel in channels"
            :key="channel.label"
          >
            <dt class="text-[12px] tracking-[0.16em] uppercase text-primary-400 mb-1">
              {{ channel.label }}
            </dt>
            <dd>
              <a
                v-if="channel.link"
                :href="channel.link"
                target="_blank"
                rel="noopener"
                class="text-[17px] hover:underline"
              >{{ channel.value }}</a>
              <span
                v-else
                class="text-[17px]"
              >{{ channel.value }}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="border border-primary-100 p-6 md:p-8 self-start">
        <div
          v-if="sent"
          class="flex flex-col items-start gap-4 py-6"
        >
          <div class="flex items-center gap-2.5">
            <SfIconCheckCircle class="text-black" />
            <h3 class="text-[22px] font-light tracking-[-0.01em]">
              {{ $t('cms.contactForm.sentHeading') }}
            </h3>
          </div>
          <p class="text-primary-500 font-light max-w-[420px]">
            {{ form.name ? $t('cms.contactForm.sentMessageName', { name: form.name }) : $t('cms.contactForm.sentMessage') }}
          </p>
          <button
            type="button"
            class="text-[13px] font-medium underline underline-offset-4 decoration-primary-300 hover:decoration-black transition-colors"
            @click="reset"
          >
            {{ $t('cms.contactForm.sendAnother') }}
          </button>
        </div>
        <form
          v-else
          novalidate
          class="flex flex-col gap-5"
          @submit.prevent="submit"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label>
              <UiFormLabel>{{ $t('contactInfo.name') }}</UiFormLabel>
              <SfInput
                v-model="form.name"
                name="name"
                :invalid="showErrors && !form.name.trim()"
              />
            </label>
            <label>
              <UiFormLabel>{{ $t('contactInfo.email') }}</UiFormLabel>
              <SfInput
                v-model="form.email"
                name="email"
                type="email"
                :invalid="showErrors && !emailValid"
              />
            </label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label>
              <UiFormLabel>{{ $t('form.phoneLabel') }}</UiFormLabel>
              <SfInput
                v-model="form.phone"
                name="phone"
                type="tel"
                :invalid="showErrors && !form.phone.trim()"
              />
            </label>
            <label>
              <UiFormLabel>{{ $t('cms.contactForm.subjectLabel') }}</UiFormLabel>
              <SfInput
                v-model="form.subject"
                name="subject"
                :invalid="showErrors && !form.subject.trim()"
              />
            </label>
          </div>
          <label>
            <UiFormLabel>{{ $t('cms.contactForm.messageLabel') }}</UiFormLabel>
            <SfTextarea
              v-model="form.message"
              name="message"
              :rows="5"
              :invalid="showErrors && !form.message.trim()"
              class="w-full"
            />
          </label>
          <UiFormMessage v-if="apiError">
            {{ apiError }}
          </UiFormMessage>
          <SfButton
            type="submit"
            :disabled="loading"
            class="self-start min-h-[52px] px-8 text-[13px] font-medium"
          >
            {{ loading ? $t('cms.contactForm.sending') : $t('cms.contactForm.submit') }}
          </SfButton>
        </form>
      </div>
    </div>
  </section>
</template>
