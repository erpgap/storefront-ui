<script setup lang="ts">
import { SfDrawer, SfButton, SfIconClose } from '@storefront-ui/vue';

export type CategorySidebarProps = {
  isOpen: boolean;
};
export type CategorySidebarEmits = (event: 'close') => void;

defineProps<CategorySidebarProps>();
defineEmits<CategorySidebarEmits>();
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-in-out"
    leave-active-class="transition duration-500 ease-in-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <SfDrawer
      v-show="isOpen"
      :model-value="true"
      :disable-click-away="true"
      :disable-esc="true"
      class="w-full shadow-none lg:translate-x-0 z-[100] lg:z-0 lg:static lg:!block -translate-x-full shrink-0 lg:w-[303px] bg-white"
      data-testid="category-sidebar"
    >
      <div class="grid grid-rows-category-sidebar h-full lg:block">
        <div class="p-4 flex justify-between items-center lg:hidden">
          <span class="font-bold text-lg">Filter</span>
          <SfButton variant="tertiary" :aria-label="$t('closeListSettings')" @click="$emit('close')">
            <template #prefix>
              <SfIconClose class="text-neutral-500" />
            </template>
          </SfButton>
        </div>
        <div class="overflow-y-auto lg:overflow-y-visible py-4 lg:p-0">
          <slot />
        </div>
      </div>
    </SfDrawer>
  </transition>
</template>
