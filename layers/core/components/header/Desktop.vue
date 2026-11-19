<script lang="ts" setup>
import {
  SfButton,
  SfInput,
  useDisclosure,
  useTrapFocus,
} from '@storefront-ui/vue'
import { onClickOutside } from '@vueuse/core'

const { isOpen: isSearchOpen, toggle: toggleSearch, close: closeSearch } = useDisclosure()

const { t } = useI18n()
const { items: websiteMenu } = useWebsiteMenu()

// The menu edited in Odoo (Website > Menus); these links only stand in when
// Odoo has none to give, so the header is never left empty.
const fallbackMenu = computed(() => [
  { labelKey: 'core.siteLinks.topSellers', to: '/products' },
  { labelKey: 'core.siteLinks.newArrivals', to: '/products?sort=newest,DESC' },
  { labelKey: 'core.siteLinks.women', to: '/women' },
  { labelKey: 'core.siteLinks.men', to: '/men' },
].map((link, index) => ({ id: -1 - index, label: t(link.labelKey), to: link.to, external: false, children: [] })))
const menuItems = computed(() => websiteMenu.value.length ? websiteMenu.value : fallbackMenu.value)

const menuRef = ref()
const searchPanelRef = ref<HTMLElement>()
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
      <div class="narrow-container h-[76px] grid grid-cols-[auto_1fr_auto] items-center gap-8">
        <!-- Left: brand -->
        <NuxtLink
          to="/"
          :aria-label="$t('core.header.homeLink')"
          class="text-[26px] md:text-[28px] text-black"
        >
          <SiteLogo />
        </NuxtLink>

        <!-- Center: the website menu -->
        <nav
          class="hidden lg:flex justify-center self-stretch min-w-0"
          :aria-label="$t('core.header.navigation')"
        >
          <HeaderNavMenu :items="menuItems" />
        </nav>

        <!-- Right: actions -->
        <div class="flex justify-end items-center gap-1">
          <SfButton
            variant="tertiary"
            square
            :aria-label="$t('search')"
            :aria-expanded="isSearchOpen"
            class="text-black hover:bg-white active:bg-white rounded-md"
            @click="toggleSearch()"
          >
            <UiLineIcon
              name="search"
              class="text-black!"
            />
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
        <div
          v-if="isSearchOpen"
          ref="searchPanelRef"
          class="border-t border-primary-100 bg-white"
        >
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
                :placeholder="$t('search')"
                autofocus
                class="[&::-webkit-search-cancel-button]:appearance-none"
                wrapper-class="h-11 pr-0 active:ring-black! focus-within:ring-black! hover:ring-black! active:ring-1! focus-within:ring-1!"
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
                      <UiLineIcon
                        name="search"
                        :size="20"
                        class="text-black"
                      />
                    </SfButton>
                  </span>
                </template>
              </SfInput>
              <SearchHitList
                v-if="showResultSearch"
                dropdown
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
