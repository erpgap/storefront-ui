<script lang="ts" setup>
import {
  SfButton,
  SfInput,
  useDisclosure,
  useTrapFocus,
} from '@storefront-ui/vue'
import { onClickOutside } from '@vueuse/core'
import DesktopSearchList from '../../../search-default/components/DesktopSearchList.vue'

const { isOpen: isSearchOpen, toggle: toggleSearch, close: closeSearch } = useDisclosure()

// TODO: point each nav item to a real category slug (links handled later)
const navItems = [
  { label: 'Top Sellers', link: '/products' },
  { label: 'New Arrivals', link: '/products?sort=newest,DESC' },
  { label: 'Women', link: '/women' },
  { label: 'Men', link: '/men' },
]

const menuRef = ref()
const searchPanelRef = ref<HTMLElement | null>(null)
const formSearchTemplateRef = ref<HTMLElement | null>(null)

const {
  searchInputValue,
  search,
  searchHits,
  selectHit,
  showResultSearch,
  enterPress,
} = useSearch(formSearchTemplateRef)

const NuxtLink = resolveComponent('NuxtLink')

// On Enter: go to results and close the search panel, so the autocomplete
// dropdown (which a debounced search would otherwise re-open) doesn't sit on
// top of the results page. Closing the panel also unfocuses the input.
const handleSearchEnter = () => {
  enterPress()
  showResultSearch.value = false
  closeSearch()
}

watch(searchInputValue, () => {
  search()
})

useTrapFocus(searchPanelRef, { activeState: isSearchOpen, arrowKeysUpDown: true, initialFocus: 'autofocus' })

onClickOutside(searchPanelRef, () => {
  showResultSearch.value = false
  closeSearch()
})
</script>

<template>
  <div ref="menuRef">
    <header class="text-black w-full">
      <div class="narrow-container h-[76px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <!-- Left: category navigation -->
        <nav class="hidden lg:flex gap-8" aria-label="SF Navigation">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.link"
            class="group relative py-1.5 text-[13px] tracking-[0.08em] uppercase text-primary-600 whitespace-nowrap transition-colors hover:text-black"
          >
            {{ item.label }}
            <span class="absolute left-0 bottom-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
          </NuxtLink>
        </nav>

        <!-- Center: brand -->
        <NuxtLink to="/" aria-label="Sf Homepage" class="justify-self-center text-[26px] md:text-[28px] text-black">
          <AlokaiLogo />
        </NuxtLink>

        <!-- Right: actions -->
        <div class="flex justify-end items-center gap-1">
          <SfButton
            variant="tertiary"
            square
            aria-label="Search"
            :aria-expanded="isSearchOpen"
            class="text-black hover:bg-white active:bg-white rounded-md"
            @click="toggleSearch()"
          >
            <UiLineIcon name="search" class="!text-black" />
          </SfButton>
          <HeaderButtonLogin />
          <HeaderButtonWishlist />
          <HeaderButtonCart />
        </div>
      </div>

      <!-- Search panel -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="isSearchOpen" ref="searchPanelRef" class="border-t border-primary-100 bg-white">
          <div class="narrow-container py-4">
            <form
              ref="formSearchTemplateRef"
              role="search"
              class="relative w-full"
              @submit.prevent
            >
              <SfInput
                v-model="searchInputValue"
                type="text"
                placeholder="Search"
                autofocus
                class="[&::-webkit-search-cancel-button]:appearance-none"
                wrapper-class="h-11 pr-0 active:!ring-black focus-within:!ring-black hover:!ring-black active:!ring-1 focus-within:!ring-1"
                size="base"
                @keydown.enter.prevent="handleSearchEnter"
              >
                <template #suffix>
                  <span class="flex items-center">
                    <SfButton
                      type="submit"
                      variant="tertiary"
                      square
                      class="rounded-l-none hover:bg-transparent active:bg-transparent"
                      @click="handleSearchEnter"
                    >
                      <Icon name="ion:search" size="20px" class="text-black" />
                    </SfButton>
                  </span>
                </template>
              </SfInput>
              <DesktopSearchList
                v-if="showResultSearch"
                :hits="searchHits"
                :search-text="searchInputValue"
                @select="selectHit"
              />
            </form>
          </div>
        </div>
      </transition>
    </header>
  </div>
</template>
