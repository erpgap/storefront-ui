<script lang="ts" setup>
defineEmits<{
  navigate: []
}>()
</script>

<template>
  <nav :aria-label="$t('account.heading')">
    <ul class="flex">
      <li class="flex-1 border-t border-r border-primary-100">
        <NuxtLink
          to="/my-account"
          class="bg-primary-50 h-full w-full py-4 text-center flex items-center justify-center gap-3"
          @click="$emit('navigate')"
        >
          <UiLineIcon
            name="account"
            :size="22"
            class="text-black!"
          />
          {{ $t('account.navBarBottomHeading') }}
        </NuxtLink>
      </li>
      <li class="flex-1 border-t border-primary-100">
        <NuxtLink
          to="/wishlist"
          class="bg-primary-50 h-full w-full py-4 text-center flex items-center justify-center gap-3"
          @click="$emit('navigate')"
        >
          <UiLineIcon
            name="heart"
            :size="22"
            class="text-black!"
          />
          {{ $t('wishlist.wishlist') }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
