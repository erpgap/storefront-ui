<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')

const { isAuthenticated } = useAuth()
</script>

<template>
  <!-- <ClientOnly> -->
  <SfButton
    class="group relative text-black hover:bg-white active:bg-white rounded-md"
    variant="tertiary"
    :to="isAuthenticated ? '/my-account/my-orders' : '/login'"
    :tag="NuxtLink"
    square
  >
    <template #prefix>
      <UiLineIcon name="account" class="!text-black" />
    </template>
  </SfButton>
  <!--
    <template #fallback>
      <SfButton
        class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md"
        variant="tertiary"
        square
      >
        <template #prefix>
          <Icon name="ion:person-outline" size="22px" />
        </template>
      </SfButton>
    </template>
  </ClientOnly> -->
</template>
