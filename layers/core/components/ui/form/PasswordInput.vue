<template>
  <SfInput :type="isPasswordVisible ? 'text' : 'password'">
    <template #suffix>
      <!-- Named for screen readers, which otherwise announce just "button". -->
      <button
        type="button"
        :aria-label="isPasswordVisible ? $t('core.ui.hidePassword') : $t('core.ui.showPassword')"
        @click="isPasswordVisible = !isPasswordVisible"
      >
        <component
          :is="isPasswordVisible ? SfIconVisibilityOff : SfIconVisibility"
          aria-hidden="true"
        />
      </button>
    </template>
  </SfInput>
</template>

<script lang="ts" setup>
import { SfInput, SfIconVisibility, SfIconVisibilityOff } from '@storefront-ui/vue'

const isPasswordVisible = ref<boolean>()
</script>
