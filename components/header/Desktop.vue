<script lang="ts" setup>
import {
  SfButton,
  SfDrawer,
  SfInput,
  SfListItem,
  useDisclosure,
  useTrapFocus,
} from "@storefront-ui/vue";
import { onClickOutside } from "@vueuse/core";
import { Category } from "~/graphql";

const { isOpen, toggle, close } = useDisclosure();

const menuRef = ref();
const drawerRef = ref();
const formSearchTemplateRef = ref(null);

const {
  searchInputValue,
  highlightNext,
  highlightPrevious,
  highlightedIndex,
  search,
  searchHits,
  selectHit,
  showResultSearch,
} = useSearch(formSearchTemplateRef);

const NuxtLink = resolveComponent("NuxtLink");
const filteredCategories = inject<Category[]>("filteredTopCategories");

useTrapFocus(drawerRef, {
  activeState: isOpen,
  arrowKeysUpDown: true,
  initialFocus: "container",
});

onClickOutside(menuRef, () => {
  close();
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed !w-screen !h-screen inset-0 bg-neutral-500 bg-opacity-50 transition-opacity duration-1000 top-index"
  />
  <header
    ref="menuRef"
    class="text-white h-14 md:h-20 flex z-50 md:sticky md:top-0 md:shadow-md flex-wrap md:flex-nowrap w-full py-2 md:py-5 border-0 bg-primary-700 border-neutral-200 md:z-10"
  >
    <div
      class="flex items-center jfustify-between lg:justify-start h-full w-full narrow-container"
    >
      <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 md:h-7 -mt-1.5">
        <VsfLogo />
      </NuxtLink>
      <SfButton
        class="hidden lg:flex text-white font-body bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white ml-6"
        type="button"
        :aria-haspopup="true"
        :aria-expanded="isOpen"
        variant="tertiary"
        square
        @click="toggle()"
      >
        <template #suffix>
          <Icon name="ion:chevron-down-sharp" />
        </template>
        <span class="hidden md:inline-flex whitespace-nowrap px-2"
          >Browse products</span
        >
      </SfButton>
      <nav>
        <ul>
          <li role="none">
            <transition
              enter-active-class="transform transition duration-500 ease-in-out"
              leave-active-class="transform transition duration-500 ease-in-out"
              enter-from-class="-translate-x-full md:translate-x-0 md:opacity-0"
              enter-to-class="translate-x-0 md:translate-x-0 md:opacity-100"
              leave-from-class="translate-x-0 md:opacity-100"
              leave-to-class="-translate-x-full md:translate-x-0 md:opacity-0"
            >
              <SfDrawer
                ref="drawerRef"
                v-model="isOpen"
                disable-click-away
                placement="top"
                class="bg-white p-0 max-h-screen overflow-y-auto lg:!absolute lg:!top-[5rem] max-w-full lg:p-6 top-index"
              >
                <div
                  class="grid grid-cols-1 lg:gap-x-6 lg:grid-cols-3 lg:narrow-container lg:relative"
                >
                  <div
                    v-for="{ name, childs, id } in filteredCategories"
                    :key="id"
                    class="[&:nth-child(2)]:pt-0 pt-6 md:pt-0 text-black"
                  >
                    <h2
                      role="presentation"
                      class="typography-text-base font-medium text-neutral-900 whitespace-nowrap p-4 lg:py-1.5"
                    >
                      {{ name }}
                    </h2>
                    <hr class="mb-3.5" />
                    <ul>
                      <li v-for="child in childs" :key="child.id">
                        <SfListItem
                          v-if="child.childs !== null"
                          tag="a"
                          :href="child.slug"
                          size="sm"
                          role="none"
                          class="typography-text-base lg:typography-text-sm py-4 lg:py-1.5"
                        >
                          {{ child.name }}
                        </SfListItem>
                      </li>
                    </ul>
                  </div>
                  <div
                    class="flex flex-col items-center justify-center bg-neutral-100 lg:rounded-md border-neutral-300 overflow-hidden grow"
                  >
                    <NuxtImg
                      src="/images/watch.png"
                      alt="New in designer watches"
                      class="object-contain"
                    />
                    <p
                      class="mb-4 mt-4 px-4 text-center text-black typography-text-base font-medium"
                    >
                      New in designer watches
                    </p>
                  </div>
                  <SfButton
                    square
                    size="sm"
                    variant="tertiary"
                    aria-label="Close navigation menu"
                    class="lg:absolute lg:right-0 lg:top-0 hover:bg-white active:bg-white"
                    @click="close()"
                  >
                    <Icon
                      name="ion:close"
                      class="text-neutral-500"
                      size="20px"
                    />
                  </SfButton>
                </div>
              </SfDrawer>
            </transition>
          </li>
        </ul>
      </nav>
      <form
        ref="formSearchTemplateRef"
        role="search"
        class="hidden lg:flex flex-[100%] mt-2 md:mt-0 md:ml-10 pb-2 md:pb-0 relative w-full"
        @submit.prevent
      >
        <SfInput
          v-model="searchInputValue"
          type="search"
          class="[&::-webkit-search-cancel-button]:appearance-none"
          placeholder="Search"
          wrapper-class="flex-1 h-10 pr-0"
          size="base"
          @input="search"
          @keydown.up.prevent="highlightPrevious"
          @keydown.down.prevent="highlightNext"
          @keydown.enter.prevent="selectHit(searchHits[highlightedIndex])"
        >
          <template #suffix>
            <span class="flex items-center">
              <SfButton
                variant="tertiary"
                square
                aria-label="search"
                type="submit"
                class="rounded-l-none hover:bg-transparent active:bg-transparent"
              >
                <Icon name="ion:search" size="20px" />
              </SfButton>
            </span>
          </template>
        </SfInput>

        <transition
          enter-active-class="transform transition duration-500 ease-in-out"
          leave-active-class="transform transition duration-500 ease-in-out"
          enter-from-class="-translate-x-full md:translate-x-0 md:opacity-0"
          enter-to-class="translate-x-0 md:translate-x-0 md:opacity-100"
          leave-from-class="translate-x-0 md:opacity-100"
          leave-to-class="-translate-x-full md:translate-x-0 md:opacity-0"
        >
          <SearchClerk
            v-if="showResultSearch"
            :hits="searchHits"
            :highlighted-index="highlightedIndex"
            @select="selectHit"
          />
        </transition>
      </form>
      <nav
        class="hidden lg:flex flex-nowrap justify-end items-center md:ml-10 gap-x-1"
        aria-label="SF Navigation"
      >
        <HeaderButtonWishlist />
        <HeaderButtonCart />
        <HeaderButtonLogin />
      </nav>
    </div>
  </header>
</template>
