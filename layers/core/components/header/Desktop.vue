<script lang="ts" setup>
  import {
    SfButton,
    SfDrawer,
    SfInput,
    SfListItem,
    useDisclosure,
    useTrapFocus,
  } from '@storefront-ui/vue'
  import {
    onClickOutside
  } from '@vueuse/core'
  import type {
    Category
  } from '~/graphql'

  const {
    isOpen,
    toggle,
    close
  } = useDisclosure()

  const menuRef = ref()
  const drawerRef = ref()
  const formSearchTemplateRef = ref(null)

  const {
    searchInputValue,
    search,
    searchHits,
    selectHit,
    showResultSearch,
    enterPress,
  } = useSearch(formSearchTemplateRef)

  const router = useRouter()
  const NuxtLink = resolveComponent('NuxtLink')
  const categoriesForMegaMenu = inject < Category[] > ('categoriesForMegaMenu')

  const goTo = (slug: string) => {
    close()
    router.push(slug)
  }

  useTrapFocus(drawerRef, {
    activeState: isOpen,
    arrowKeysUpDown: true,
    initialFocus: 'container',
  })

  onClickOutside(formSearchTemplateRef, () => {
    showResultSearch.value = false
  })
</script>

<template>
  <div>
    <div v-if="isOpen || showResultSearch"
      class="fixed !w-screen !h-screen inset-0 bg-neutral-500 bg-opacity-50 transition-opacity duration-1000 top-index" />
    <header ref="menuRef" class="text-white w-full bg-white">
      <!-- Menu Top -->
      <div class="py-5 border-b border-[#E5E7EB]">
        <div class="h-full w-full narrow-container flex items-center justify-between">
          <!-- Search -->
          <form ref="formSearchTemplateRef" role="search" class="max-w-[300px] flex flex-[100%] relative w-full"
            @submit.prevent>
            <SfInput v-model="searchInputValue" type="text" class="[&::-webkit-search-cancel-button]:appearance-none"
              placeholder="Search"
              wrapper-class="flex-1 h-10 pr-0 active:!ring-black focus-within:!ring-black hover:!ring-black active:!ring-1 focus-within:!ring-1"
              size="base" @input="search()" @keydown.enter.prevent="enterPress">
              <template #suffix>
                <span class="flex items-center">
                  <SfButton variant="tertiary" square aria-label="search" type="submit"
                    class="rounded-l-none hover:bg-transparent active:bg-transparent" @click="enterPress">
                    <Icon name="ion:search" size="20px" class="text-black" />
                  </SfButton>
                </span>
              </template>
            </SfInput>

            <transition enter-active-class="transform transition duration-500 ease-in-out"
              leave-active-class="transform transition duration-500 ease-in-out"
              enter-from-class="-translate-x-full md:translate-x-0 md:opacity-0"
              enter-to-class="translate-x-0 md:translate-x-0 md:opacity-100"
              leave-from-class="translate-x-0 md:opacity-100"
              leave-to-class="-translate-x-full md:translate-x-0 md:opacity-0">
              <DesktopSearchList v-if="showResultSearch" :hits="searchHits" :search-text="searchInputValue"
                @select="selectHit" />
            </transition>
          </form>
          <!-- Logo -->
          <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 md:h-7">
            <AlokaiLogo />
          </NuxtLink>
          <!-- Icons -->
          <nav class="min-w-[300px] flex flex-nowrap justify-end items-center gap-x-1" aria-label="SF Navigation">
            <HeaderButtonWishlist />
            <HeaderButtonCart />
            <HeaderButtonLogin />
          </nav>
        </div>
      </div>
      <!-- Menu Bottom -->
      <div class="py-3.5 border-b border-[#E5E7EB]">
        <div class="w-full narrow-container">
          <ul class="flex gap-10">
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Living Room Seating</a></p></li>
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Tables</a></p></li>
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Bedroom Furniture</a></p></li>
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Storage & Shelving</a></p></li>
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Lighting</a></p></li>
            <li><p><a href="#" class="text-[14px] text-black uppercase tracking-[0.5px]">Home Office</a></p></li>
          </ul>
        </div>
      </div>
    </header>
  </div>
</template>