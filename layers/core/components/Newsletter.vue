<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'
import { ref } from 'vue'

const { newsletterSubscribe, loading, apiError } = useCore()

const inputValue = ref('')
const emailValidation = ref()
const subscribed = ref(false)

const subscribeNewsletter = async () => {
  const ok = await newsletterSubscribe({ email: inputValue.value })
  if (ok) {
    subscribed.value = true
    inputValue.value = ''
  }
}
</script>

<template>
  <section class="bg-black text-white py-[clamp(64px,9vw,132px)]">
    <div class="narrow-container max-w-[720px] text-center">
      <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)] mb-4">
        Join the list
      </h2>
      <p class="text-white/60 mb-9">
        Be first to know about new collections, private sales and design stories.
      </p>
      <p
        v-if="subscribed"
        class="max-w-[480px] mx-auto border border-white/25 text-white text-[14px] py-3.5 px-5"
        role="status"
      >
        Thanks — you're on the list. Look out for our next drop.
      </p>
      <form
        v-else
        class="flex flex-col sm:flex-row gap-3 max-w-[480px] mx-auto"
        @submit.prevent="subscribeNewsletter()"
      >
        <UiFormEmailInput
          v-model="inputValue"
          placeholder="Enter your email address"
          class="flex-1"
          @is-field-valid="(n: any) => (emailValidation = n)"
        />
        <SfButton
          :disabled="!emailValidation || loading"
          type="submit"
          variant="tertiary"
          class="!bg-white !text-black hover:!bg-primary-50 !border-none !ring-0 !shadow-none h-[48px] sm:h-auto px-7 text-[13px] tracking-[0.12em] uppercase font-medium disabled:!opacity-60"
        >
          {{ loading ? 'Subscribing…' : 'Subscribe' }}
        </SfButton>
      </form>

      <UiFormError v-if="apiError && !subscribed" class="max-w-[480px] mx-auto mt-4">
        {{ apiError }}
      </UiFormError>
    </div>
  </section>
</template>
