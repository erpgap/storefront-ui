<script lang="ts" setup>
import {
  SfButton,
  SfDrawer,
  SfBadge,
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconPerson,
  SfIconClose,
  SfIconExpandMore,
  SfListItem,
  useDisclosure,
  useTrapFocus,
  SfIconMenu,
  SfInput,
  SfIconSearch,
} from "@storefront-ui/vue";
import { onClickOutside } from "@vueuse/core";
import { useRouter, useRoute } from "#vue-router";
import { AlgoliaHitType } from "@/types/algolia";

defineProps<{ filled?: boolean }>();

const { loadCategoryList, categories } = useCategory();
const { isOpen, toggle, close } = useDisclosure();
const { wishlistSidebarIsOpen, toggleWishlistSideBar } = useUiState();
const { wishlistTotalItems, loadWishlist } = useWishlist();

const { result, search: algoliaSearch } = useAlgoliaSearch("header");

const NuxtLink = resolveComponent("NuxtLink");

const router = useRouter();
const route = useRoute();

const menuRef = ref();
const drawerRef = ref();
const searchRef = ref();
const showSearchClerkRef = ref();
const highlightedIndex = ref(-1);

onMounted(async () => {
  await loadWishlist();
});

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

const actionItems = [
  {
    icon: SfIconShoppingCart,
    label: "",
    ariaLabel: "Cart",
    role: "button",
    badge: true,
    link: "/cart",
  },
  {
    icon: SfIconPerson,
    label: "Log in",
    ariaLabel: "Log in",
    role: "login",
    badge: false,
    link: "/login",
  },
];

const bannerDetails = {
  image: "/images/watch.png",
  title: "New in designer watches",
};

const handleWishlistSideBar = async () => {
  toggleWishlistSideBar();
};

await loadCategoryList({ filter: { parent: true } });

const searchHits = computed<AlgoliaHitType[]>(() => result.value?.hits || []);

const selectHit = (hit: AlgoliaHitType) => {
  router.push(`/search?search=${hit?.name || inputValue.value}`);
  showSearchClerkRef.value = false;
  inputValue.value = hit.name;
};

const cartCounter = useCookie<number>("cart-counter");

const inputValue = ref(route.query?.search || "");

const search = async (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  if (!query) {
    showSearchClerkRef.value = false;
    return;
  }
  await algoliaSearch({
    query: (event.target as HTMLInputElement).value,
  });
  showSearchClerkRef.value = true;
  highlightedIndex.value = -1;
};

const openSearchClerk = computed(
  () => searchHits.value?.length > 0 && showSearchClerkRef.value
);

const setInputValue = (value: string) => {
  inputValue.value = value;
};

const highlightPrevious = () => {
  if (highlightedIndex.value === 0) {
    highlightedIndex.value = searchHits.value.length - 1;
  } else {
    highlightedIndex.value -= 1;
  }
  setInputValue(searchHits.value[highlightedIndex.value]?.name);
};

const highlightNext = () => {
  if (highlightedIndex.value === searchHits.value.length - 1) {
    highlightedIndex.value = 0;
  } else {
    highlightedIndex.value += 1;
  }
  setInputValue(searchHits.value[highlightedIndex.value]?.name);
};
</script>

<template>
  <div class="w-full">
    <div
      v-if="isOpen"
      class="fixed !w-screen !h-screen inset-0 bg-neutral-500 bg-opacity-50 transition-opacity duration-1000 top-index"
    />
    <header
      ref="menuRef"
      :class="[
        'h-14 md:h-20 flex z-50 md:sticky md:top-0 md:shadow-md flex-wrap md:flex-nowrap w-full py-2 md:py-5 border-0 bg-primary-700 border-neutral-200 md:z-10',
        { 'bg-primary-700 text-white': filled },
        { 'bg-white border-b border-neutral-200': !filled },
      ]"
    >
      <div
        class="flex items-center justify-between lg:justify-start h-full w-full narrow-container"
      >
        <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 md:h-7 -mt-1.5">
          <VsfLogo />
        </NuxtLink>
        <SfButton
          v-if="filled"
          class="hidden lg:flex text-white font-body bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white ml-6"
          type="button"
          :aria-haspopup="true"
          :aria-expanded="isOpen"
          variant="tertiary"
          square
          @click="toggle()"
        >
          <template #suffix>
            <SfIconExpandMore class="hidden md:inline-flex" />
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
                      class="sticky top-0 flex items-center justify-between py-2 px-4 bg-primary-700 lg:hidden w-full"
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
                    <SfButton
                      square
                      size="sm"
                      variant="tertiary"
                      aria-label="Close navigation menu"
                      class="hidden lg:block lg:absolute lg:right-0 lg:top-0 hover:bg-white active:bg-white"
                      @click="close()"
                    >
                      <SfIconClose class="text-neutral-500" />
                    </SfButton>
                  </div>
                </SfDrawer>
              </transition>
            </li>
          </ul>
        </nav>
        <form
          v-if="filled"
          ref="searchRef"
          role="search"
          class="hidden lg:flex flex-[100%] mt-2 md:mt-0 md:ml-10 pb-2 md:pb-0 relative w-full"
          @submit.prevent
        >
          <SfInput
            v-model="inputValue"
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
                  <SfIconSearch />
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
              v-if="openSearchClerk"
              :hits="searchHits"
              :highlighted-index="highlightedIndex"
              @select="selectHit"
            />
          </transition>
        </form>
        <nav
          v-if="filled"
          class="hidden lg:flex flex-nowrap justify-end items-center md:ml-10 gap-x-1"
          aria-label="SF Navigation"
        >
          <div>
            <SfButton
              class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 mr-1 -ml-0.5 rounded-md"
              type="button"
              :aria-haspopup="true"
              :aria-expanded="wishlistSidebarIsOpen"
              variant="tertiary"
              square
              @click="handleWishlistSideBar"
            >
              <template #prefix>
                <SfIconFavorite class="text-white" />
                <SfBadge
                  :content="wishlistTotalItems"
                  class="outline outline-primary-700 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-900 flex justify-center"
                  data-testid="wishlist-badge"
                />
              </template>
            </SfButton>
            <WishlistSidebar
              :is-open="wishlistSidebarIsOpen"
              @close="toggleWishlistSideBar"
            />
          </div>
          <SfButton
            v-for="{ ariaLabel, label, icon, link, badge, role } in actionItems"
            :key="ariaLabel"
            class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 mr-1 -ml-0.5 rounded-md"
            :aria-label="ariaLabel"
            :tag="NuxtLink"
            :to="link"
            variant="tertiary"
            square
          >
            <template #prefix>
              <Component :is="icon" />
              <SfBadge
                v-if="badge"
                :content="cartCounter || 0"
                class="outline outline-primary-700 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-900 flex justify-center"
                data-testid="cart-badge"
              />
            </template>
            <span
              v-if="role === 'login'"
              class="hidden lg:inline-flex whitespace-nowrap pr-2"
              >{{ label }}</span
            >
          </SfButton>
        </nav>
        <div v-if="filled">
          <SfButton
            v-if="filled"
            variant="tertiary"
            class="relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md lg:hidden"
            square
            @click="$emit('searchModalOpen')"
          >
            <SfIconSearch />
          </SfButton>
          <SfButton
            class="block lg:hidden text-white font-body bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white self-end"
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
  </div>
</template>
