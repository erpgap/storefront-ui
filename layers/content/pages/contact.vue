<script setup lang="ts">
import { SfInput, SfTextarea, SfButton, SfIconCheckCircle } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')

useHead({
  title: 'Contact — Alokai by ERPGAP',
  meta: [{ name: 'description', content: 'Get in touch with the team behind Alokai.' }],
})

const form = reactive({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)

const submit = () => {
  // Demo store — no backend. Acknowledge locally.
  sent.value = true
}

const reset = () => {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
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
      image="/img/content/contact-banner.jpg"
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
        <div class="border border-primary-100 p-6 md:p-8">
          <div v-if="sent" class="flex flex-col items-start gap-4 py-6">
            <SfIconCheckCircle class="text-black" />
            <h3 class="text-[22px] font-light tracking-[-0.01em]">Message sent</h3>
            <p class="text-primary-500 font-light max-w-[420px]">
              Thanks for reaching out{{ form.name ? `, ${form.name}` : '' }}. This is a demo store, so no
              message was actually delivered — but on a live ERPGAP build, we'd be in touch shortly.
            </p>
            <SfButton variant="tertiary" class="!px-0" @click="reset">Send another message</SfButton>
          </div>

          <form v-else class="flex flex-col gap-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label>
                <UiFormLabel>Name</UiFormLabel>
                <SfInput v-model="form.name" name="name" required />
              </label>
              <label>
                <UiFormLabel>Email</UiFormLabel>
                <SfInput v-model="form.email" name="email" type="email" required />
              </label>
            </div>
            <label>
              <UiFormLabel>Subject</UiFormLabel>
              <SfInput v-model="form.subject" name="subject" required />
            </label>
            <label>
              <UiFormLabel>Message</UiFormLabel>
              <SfTextarea v-model="form.message" name="message" :rows="5" required class="w-full" />
            </label>
            <SfButton type="submit" class="self-start min-h-[52px] px-8 text-[13px] font-medium">
              Send message
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
