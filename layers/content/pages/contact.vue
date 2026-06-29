<script setup lang="ts">
import { SfInput, SfTextarea, SfButton, SfIconCheckCircle } from '@storefront-ui/vue'
import { isValidEmail } from '~~/app/utils/validation'

const NuxtLink = resolveComponent('NuxtLink')

useHead({
  title: 'Contact — Alokai by ERPGAP',
  meta: [{ name: 'description', content: 'Get in touch with the team behind Alokai.' }],
})

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

  const ok = await contactUs({
    contactus: {
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    },
  })
  if (ok) sent.value = true
}

const reset = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.subject = ''
  form.message = ''
  apiError.value = ''
  showErrors.value = false
  sent.value = false
}

const channels = [
  { label: 'Email', value: 'info@erpgap.com', href: 'mailto:info@erpgap.com' },
  { label: 'Website', value: 'erpgap.com', href: 'https://www.erpgap.com/' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Help"
      title="Get in touch"
      subtitle="Questions about an order, or about building your own Alokai storefront? We're here."
      image="/img/content/contact-banner.webp"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)]">
      <ContentDemoNote class="mb-12 max-w-[820px]" />

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">
        <!-- Contact details -->
        <div>
          <h2 class="text-[24px] font-light tracking-[-0.01em] mb-8">
            Talk to us
          </h2>
          <dl class="space-y-6">
            <div v-for="c in channels" :key="c.label">
              <dt class="text-[12px] tracking-[0.16em] uppercase text-primary-400 mb-1">{{ c.label }}</dt>
              <dd>
                <a :href="c.href" target="_blank" rel="noopener" class="text-[17px] hover:underline">{{ c.value }}</a>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Form / success -->
        <div class="border border-primary-100 p-6 md:p-8 self-start">
          <div v-if="sent" class="flex flex-col items-start gap-4 py-6">
            <div class="flex items-center gap-2.5">
              <SfIconCheckCircle class="text-black" />
              <h3 class="text-[22px] font-light tracking-[-0.01em]">Message sent</h3>
            </div>
            <p class="text-primary-500 font-light max-w-[420px]">
              Thanks for reaching out{{ form.name ? `, ${form.name}` : '' }}. We've received your
              message and will get back to you shortly.
            </p>
            <button
              type="button"
              class="text-[13px] font-medium underline underline-offset-4 decoration-primary-300 hover:decoration-black transition-colors"
              @click="reset"
            >
              Send another message
            </button>
          </div>

          <form v-else novalidate class="flex flex-col gap-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label>
                <UiFormLabel>Name</UiFormLabel>
                <SfInput v-model="form.name" name="name" :invalid="showErrors && !form.name.trim()" />
              </label>
              <label>
                <UiFormLabel>Email</UiFormLabel>
                <SfInput v-model="form.email" name="email" type="email" :invalid="showErrors && !emailValid" />
              </label>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label>
                <UiFormLabel>Phone</UiFormLabel>
                <SfInput v-model="form.phone" name="phone" type="tel" :invalid="showErrors && !form.phone.trim()" />
              </label>
              <label>
                <UiFormLabel>Subject</UiFormLabel>
                <SfInput v-model="form.subject" name="subject" :invalid="showErrors && !form.subject.trim()" />
              </label>
            </div>
            <label>
              <UiFormLabel>Message</UiFormLabel>
              <SfTextarea v-model="form.message" name="message" :rows="5" :invalid="showErrors && !form.message.trim()" class="w-full" />
            </label>
            <UiFormError v-if="apiError">
              {{ apiError }}
            </UiFormError>
            <SfButton
              type="submit"
              :disabled="loading"
              class="self-start min-h-[52px] px-8 text-[13px] font-medium"
            >
              {{ loading ? 'Sending…' : 'Send message' }}
            </SfButton>
          </form>
        </div>
      </div>

      <p class="mt-12 text-primary-500 font-light max-w-[820px]">
        Looking for order help first? You might find your answer in the
        <NuxtLink to="/faq" class="underline hover:text-black">FAQ</NuxtLink>,
        <NuxtLink to="/shipping" class="underline hover:text-black">Shipping</NuxtLink> or
        <NuxtLink to="/returns" class="underline hover:text-black">Returns</NuxtLink> pages.
      </p>
    </div>
  </div>
</template>
