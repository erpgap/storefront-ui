<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')

const { isAuthenticated } = useAuth()

// Pages come from a cache every visitor shares, so the server always renders
// the guest link. Following the login state during hydration left a logged-in
// shopper's link pointing at /login, since Vue does not patch a mismatched
// attribute in production; it switches once the page is live instead.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <SfButton
    class="group relative text-black hover:bg-white active:bg-white rounded-md"
    variant="tertiary"
    :to="mounted && isAuthenticated ? '/my-account/my-orders' : '/login'"
    :tag="NuxtLink"
    square
    :aria-label="$t('core.header.account')"
  >
    <template #prefix>
      <UiLineIcon
        name="account"
        class="text-black!"
      />
    </template>
  </SfButton>
</template>
