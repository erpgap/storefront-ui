<script lang="ts" setup>
import {
  SfButton,
  SfDrawer,
  SfIconClose,
  useDisclosure,
  useTrapFocus,
} from '@storefront-ui/vue'

const DRAWER_ID = 'mobile-nav-drawer'

const {
  isOpen,
  toggle,
  close,
} = useDisclosure()

const drawerRef = ref()

useTrapFocus(drawerRef, {
  activeState: isOpen,
  arrowKeysUpDown: true,
  initialFocus: 'container',
})

const isLocked = useScrollLock(import.meta.client ? document.body : null)
watch(isOpen, (open: boolean) => {
  isLocked.value = open
})
</script>

<template>
  <header class="text-black flex w-full py-3.5">
    <div class="flex items-center justify-between h-full w-full narrow-container">
      <div>
        <HeaderMobileMenuButton
          :is-open="isOpen"
          :controls="DRAWER_ID"
          @toggle="toggle()"
        />
      </div>

      <NuxtLink
        to="/"
        aria-label="Sf Homepage"
        class="text-black"
      >
        <AlokaiLogo class="text-[17px]" />
      </NuxtLink>

      <Teleport to="body">
        <Transition
          enter-active-class="transform transition duration-500 ease-in-out"
          leave-active-class="transform transition duration-500 ease-in-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <SfDrawer
            :id="DRAWER_ID"
            ref="drawerRef"
            v-show="isOpen"
            :model-value="true"
            disable-click-away
            placement="left"
            role="dialog"
            aria-modal="true"
            :aria-label="$t('navigationMenu')"
            class="!fixed !inset-y-0 !left-0 bg-white w-full h-dvh z-[200] flex flex-col"
          >
            <div class="flex justify-end shrink-0 px-4 py-3">
              <SfButton
                variant="tertiary"
                square
                :aria-label="$t('closeMenu')"
                class="!text-black"
                @click="close()"
              >
                <SfIconClose />
              </SfButton>
            </div>

            <div class="flex-1 overflow-y-auto">
              <HeaderMobileNavList @navigate="close()" />
            </div>

            <div class="shrink-0">
              <HeaderMobileMenuActions @navigate="close()" />
            </div>
          </SfDrawer>
        </Transition>
      </Teleport>

      <div>
        <HeaderButtonCart />
      </div>
    </div>
  </header>
</template>
