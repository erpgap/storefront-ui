<template>
  <div>
    <NuxtLayout name="auth" :heading="$t('auth.resetPassword.heading')">
      <form class="pb-4 md:p-6 mt-10 md:border md:border-neutral-200 rounded-md" @submit.prevent="resetPasswordHandler">
        <p class="mb-6">
          {{ $t('auth.resetPassword.info') }}
        </p>
        <label>
          <FormLabel>{{ $t('auth.resetPassword.email') }}</FormLabel>
          <SfInput v-model="customerEmail" name="email" type="email" required />
        </label>
        <div class="mt-6 flex flex-col-reverse md:flex-row gap-4">
          <SfButton :tag="NuxtLink" to="/login" class="flex-1" variant="tertiary">
            {{ $t('auth.resetPassword.backToLogin') }}
          </SfButton>
          <SfButton type="submit" class="flex-1">
            {{ $t('auth.resetPassword.continue') }}
          </SfButton>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue';

definePageMeta({
  layout: false,
});

const NuxtLink = resolveComponent('NuxtLink');
const router = useRouter();
const customerEmail = ref('');
const { resetPassword, loading, resetPasswordError } = useUser();

const resetPasswordHandler = async () => {
  await resetPassword({ email: customerEmail.value });
  if (!resetPasswordError.value) {
    router.push('/reset-password-success');
  }
};
</script>
