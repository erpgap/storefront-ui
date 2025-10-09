<script lang="ts" setup>
import { SfButton, SfLink } from '@storefront-ui/vue'
import { ref, type Ref } from 'vue'

const { newsletterSubscribe } = useCore()

const inputValue = ref('')
const emailValidation = ref()

const subscribeNewsletter = async () => {
  await newsletterSubscribe({ email: inputValue.value })
  inputValue.value = ''
}
</script>

<template>
  <div class="relative border-t border-b border-[#E5E7EB]">
    <div class="flex flex-wrap gap-4 items-center justify-center sm:justify-between narrow-container py-8 sm:py-14">
      <div class="text-center sm:text-left">
        <h3 class="text-[24px] sm:text-[28px] font-normal mb-[5px]">
          Save 20% Off Your First Order
        </h3>
        <p class="text-[16px]">
          Get alerts about new items, sales and more.
        </p>
      </div>
      <form class="w-full sm:w-auto flex border border-black rounded-md mb-4 sm:mb-0" @submit.prevent="subscribeNewsletter()">
        <UiFormEmailInput 
          v-model="inputValue" 
          @is-field-valid="(n) => (emailValidation = n)" 
          class="w-full sm:min-w-[300px]"
        />
        <SfButton :disabled="!emailValidation" type="submit" class="!bg-white !border-none !ring-none !shadow-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg>
        </SfButton>
      </form>
    </div>
  </div>
</template>
