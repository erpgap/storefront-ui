<script lang="ts" setup>
import {
  SfButton,
  SfInput,
  useDisclosure,
  useTrapFocus,
} from '@storefront-ui/vue'
import { onClickOutside } from '@vueuse/core'
import type { Category } from '~/graphql'
import DesktopSearchList from '~/layers/search-default/components/DesktopSearchList.vue'

const { isOpen, toggle, close } = useDisclosure()

const menuRef = ref()
const drawerRef = ref()
const formSearchTemplateRef = ref<HTMLElement | null>(null)

const {
  searchInputValue,
  search,
  searchHits,
  selectHit,
  showResultSearch,
  enterPress,
} = useSearch(formSearchTemplateRef)

const router = useRouter()
const route = useRoute()
const NuxtLink = resolveComponent('NuxtLink')
const categoriesForMegaMenu = inject<Category[]>('categoriesForMegaMenu')

watch(searchInputValue, () => {
  search()
})

useTrapFocus(drawerRef, { activeState: isOpen, arrowKeysUpDown: true, initialFocus: 'container' })

onClickOutside(formSearchTemplateRef, () => {
  showResultSearch.value = false
})

const goTo = (slug: string) => { close(); router.push(slug) }
</script>

<template>
  <div>
    <div v-if="isOpen || showResultSearch"
      class="fixed !w-screen !h-screen inset-0 bg-neutral-500 bg-opacity-50 transition-opacity duration-1000 top-index" />
    <header ref="menuRef" class="text-white w-full bg-white">
      <div class="py-5 border-b border-[#E5E7EB]">
        <div class="h-full w-full narrow-container flex items-center justify-between">
          <form ref="formSearchTemplateRef" role="search" class="max-w-[300px] flex flex-[100%] relative w-full"
            @submit.prevent>
            <SfInput v-model="searchInputValue" type="text" placeholder="Search"
              class="[&::-webkit-search-cancel-button]:appearance-none"
              wrapper-class="flex-1 h-10 pr-0 active:!ring-black focus-within:!ring-black hover:!ring-black active:!ring-1 focus-within:!ring-1"
              size="base" @keydown.enter.prevent="enterPress">
              <template #suffix>
                <span class="flex items-center">
                  <SfButton type="submit" variant="tertiary" square
                    class="rounded-l-none hover:bg-transparent active:bg-transparent" @click="enterPress">
                    <Icon name="ion:search" size="20px" class="text-black" />
                  </SfButton>
                </span>
              </template>
            </SfInput>
            <DesktopSearchList v-if="showResultSearch" :hits="searchHits" :search-text="searchInputValue"
              @select="selectHit" />
          </form>

          <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 md:h-7">
            <AlokaiLogo />
          </NuxtLink>

          <nav class="min-w-[300px] flex flex-nowrap justify-end items-center gap-x-1" aria-label="SF Navigation">
            <HeaderButtonWishlist />
            <HeaderButtonCart />
            <HeaderButtonLogin />
          </nav>
        </div>
      </div>

      <div class="py-3.5 border-b border-[#E5E7EB]">
        <div class="w-full narrow-container">
          <ul class="flex gap-10">
            <li v-for="category in categoriesForMegaMenu" :key="category.id">
              <NuxtLink :to="`/category/${category.id}`" class="text-[14px] text-black uppercase tracking-[0.5px]">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </header>
  </div>
</template>
