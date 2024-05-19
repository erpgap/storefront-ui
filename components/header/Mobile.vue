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

const { categories } = useCategory();
const { isOpen, toggle, close } = useDisclosure();
const { wishlistSidebarIsOpen, toggleWishlistSideBar } = useUiState();
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

const filteredCategories = computed(() =>
  categories?.value?.filter(
    (category: any) => category.name === "WOMEN" || category.name === "MEN"
  )
);

const bannerDetails = {
  image: "/images/watch.png",
  title: "New in designer watches",
};
</script>

<template>
  <header
    ref="menuRef"
    :class="[
      'text-white h-14 md:h-20 flex z-50 md:sticky md:top-0 md:shadow-md flex-wrap md:flex-nowrap w-full py-2 md:py-5 border-0 bg-primary-700 border-neutral-200 md:z-10',
    ]"
  >
    <div
      class="flex items-center justify-between lg:justify-start h-full w-full narrow-container"
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
                class="bg-white p-0 max-h-screen overflow-y-auto lg:!absolute lg:!top-[5rem] max-w-full lg:p-6 top-index"
              >
                <div
                  class="grid grid-cols-1 lg:gap-x-6 lg:grid-cols-3 lg:narrow-container lg:relative"
                >
                  <div
                    class="sticky top-0 flex items-center justify-between py-2 px-4 bg-primary-700 w-full"
                  >
                    <div
                      class="flex items-center typography-text-lg font-medium text-white"
                    >
                      Browse products
                    </div>
                    <SfButton
                      square
                      variant="tertiary"
                      aria-label="Close navigation menu"
                      class="text-white ml-2"
                      @click="close()"
                      @keydown.enter.space="close()"
                    >
                      <SfIconClose />
                    </SfButton>
                  </div>
                  <div
                    v-for="{ name, childs } in filteredCategories"
                    :key="name"
                    class="[&:nth-child(2)]:pt-0 pt-6 md:pt-0 text-black"
                  >
                    <h2
                      role="presentation"
                      class="typography-text-base font-medium text-neutral-900 whitespace-nowrap p-4 lg:py-1.5"
                    >
                      {{ name }}
                    </h2>
                    <hr class="mb-3.5" >
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
                          class="typography-text-base lg:typography-text-sm py-4 lg:py-1.5"
                        >
                          {{ name }}
                        </SfListItem>
                      </li>
                    </ul>
                  </div>
                  <div
                    class="flex flex-col items-center justify-center bg-neutral-100 lg:rounded-md border-neutral-300 overflow-hidden grow"
                  >
                    <NuxtImg
                      :src="bannerDetails.image"
                      :alt="bannerDetails.title"
                      class="object-contain"
                    />
                    <p
                      class="mb-4 mt-4 px-4 text-center text-black typography-text-base font-medium"
                    >
                      {{ bannerDetails.title }}
                    </p>
                  </div>
                </div>
              </SfDrawer>
            </transition>
          </li>
        </ul>
      </nav>

      <WishlistSidebar
        :is-open="wishlistSidebarIsOpen"
        @close="toggleWishlistSideBar"
      />

      <div class="flex">
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
  </header>
</template>
