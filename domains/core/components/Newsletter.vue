<script lang="ts" setup>
import { SfButton, SfLink } from "@storefront-ui/vue";
import { ref, type Ref } from "vue";
import { useCore } from "../composable/useCore";

const { newsletterSubscribe } = useCore();

const inputValue = ref("");
const emailValidation = ref();

const subscribeNewsletter = async () => {
  await newsletterSubscribe({ email: inputValue.value });
  inputValue.value = "";
};
</script>
<template>
  <div class="relative">
    <div class="bg-neutral-100 p-4 sm:p-10 text-center">
      <p class="typography-headline-4 sm:typography-headline-3 font-bold">
        Subscribe and get discount on your first purchase!
      </p>
      <p class="typography-text-sm sm:typography-text-base my-2 mb-4">
        Be aware of upcoming sales and events. Receive gifts and special offers!
      </p>
      <form
        class="mb-4 flex flex-col sm:flex-row gap-4 max-w-[688px] mx-auto"
        @submit.prevent="subscribeNewsletter()"
      >
        <UiFormEmailInput
          v-model="inputValue"
          @is-field-valid="(n) => (emailValidation = n)"
        />
        <SfButton :disabled="!emailValidation" type="submit" class="w-[325px]">
          Subscribe to Newsletter
        </SfButton>
      </form>
      <div class="typography-text-xs text-neutral-600">
        To learn how we process your data, visit our
        <SfLink href="#" class="!text-neutral-600">Privacy Notice</SfLink>. You
        can <SfLink href="#" class="!text-neutral-600">unsubscribe</SfLink> at
        any time without costs.
      </div>
    </div>
  </div>
</template>
