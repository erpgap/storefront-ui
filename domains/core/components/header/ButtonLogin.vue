<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')

const { isAuthenticated } = useAuth()
</script>

<template>
  <!-- <ClientOnly> -->
  <SfButton
    class="text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 mr-1 -ml-0.5 rounded-md"
    variant="tertiary"
    :to="isAuthenticated ? '/my-account/personal-data' : '/login'"
    :tag="NuxtLink"
    square
  >
    <template #prefix>
      <Icon
        :name="isAuthenticated ? 'ion:person' : 'ion:person-outline'"
        size="22px"
      />
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
