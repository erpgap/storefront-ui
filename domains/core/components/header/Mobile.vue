<script lang="ts" setup>
import {
  SfButton,
  SfDrawer,
  SfIconClose,
  SfIconMenu,
  SfIconSearch,
  SfListItem,
  useDisclosure,
  useTrapFocus,
} from "@storefront-ui/vue";
import { onClickOutside } from "@vueuse/core";
import type { Category } from "~/graphql";

const { isOpen, toggle, close } = useDisclosure();
const { searchModalToggle } = useSearch();

const NuxtLink = resolveComponent("NuxtLink");

const menuRef = ref();
const drawerRef = ref();
const searchRef = ref();
const showSearchClerkRef = ref();

useTrapFocus(drawerRef, {
  activeState: isOpen,
  arrowKeysUpDown: true,
  initialFocus: "container",
});

onClickOutside(menuRef, () => {
  close();
});

onClickOutside(searchRef, () => {
  showSearchClerkRef.value = false;
});

const categoriesForMegaMenu = inject<Category[]>("categoriesForMegaMenu");
</script>

<template>
  <header
    ref="menuRef"
    :class="[
      'text-white h-14 md:h-20 flex z-50 md:sticky md:top-0 md:shadow-md flex-wrap md:flex-nowrap w-full py-2 md:py-5 border-0 bg-primary-700 border-neutral-200 md:z-10',
    ]"
  >
    <div
      class="flex items-center justify-between h-full w-full narrow-container"
      :class="{ 'justify-start': $viewport.isGreaterOrEquals('desktopSmall') }"
    >
      <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 md:h-7 -mt-1.5">
        <VsfLogo />
      </NuxtLink>
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
                class="bg-white max-h-screen overflow-y-auto!absolute top-[56px] md:!top-[5rem] max-w-full p-6 top-index"
              >
                <div>
                  <div
                    v-for="{ name, childs, slug } in categoriesForMegaMenu"
                    :key="name"
                    class="py-2 text-black"
                  >
                    <NuxtLink
                      :to="slug"
                      role="presentation"
                      class="typography-text-base font-medium text-neutral-900 whitespace-nowrap p-2 pl-0"
                    >
                      {{ name }}
                    </NuxtLink>
                    <hr class="mb-3.5" />
                    <ul>
                      <li
                        v-for="{ name, slug, childs: subcategory } in childs"
                        :key="name"
                      >
                        <SfListItem
                          v-if="subcategory !== null"
                          tag="a"
                          :href="slug"
                          size="sm"
                          role="none"
                          class="typography-text-base lg:typography-text-sm py-2"
                        >
                          {{ name }}
                        </SfListItem>
                      </li>
                    </ul>
                  </div>
                </div>
              </SfDrawer>
            </transition>
          </li>
        </ul>
      </nav>

      <div class="flex justify-end">
        <SfButton
          variant="tertiary"
          class="relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md"
          square
          @click="searchModalToggle"
        >
          <SfIconSearch />
        </SfButton>
        <SfButton
          class="block text-white font-body bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white self-end"
          type="button"
          :aria-haspopup="true"
          :aria-expanded="isOpen"
          variant="tertiary"
          square
          @click="toggle()"
        >
          <SfIconMenu class="text-white" />
        </SfButton>
      </div>
    </div>
    <MobileSearchList search-text="123" />
  </header>
</template>
