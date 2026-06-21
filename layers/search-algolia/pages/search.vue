<script setup lang="ts">
import {
  SfButton,
  SfIconTune,
  useDisclosure,
  SfLoaderCircular,
} from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

const route = useRoute()

// A bare /search with no query term has nothing to show — send users to the
// full catalog instead.
if (!String(route.query.search ?? '').trim()) {
  await navigateTo('/products', { redirectCode: 301 })
}

const { isOpen, open, close } = useDisclosure()
const { getFacetsFromURL } = useUiHelpers()

// searching on algolia with query params
const { search, searchInputValue, loading } = useSearch()

searchInputValue.value = route.query.search as string
// fetch products with query params + ids from algolia
const {
  loadProductTemplateList,
  organizedAttributes,
  productTemplateList,
  totalItems,
  stockCount,
} = useProductTemplateList(route.fullPath)

provide('stockCount', stockCount)

const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const breadcrumbs = [
  { name: 'Home', link: '/' },
  { name: 'Search', link: '/' },
]

const maxVisiblePages = useState('search-page-max-visible', () => 1)
const setMaxVisiblePages = (isWide: boolean) =>
  (maxVisiblePages.value = isWide ? 5 : 1)

watch(isWideScreen, value => setMaxVisiblePages(value))
watch(isTabletScreen, (value) => {
  if (value && isOpen.value) {
    close()
  }
})

await search()

await loadProductTemplateList(
  getFacetsFromURL(route.query),
)

const pagination = computed(() => ({
  currentPage: route?.query?.page ? Number(route.query.page) : 1,
  totalPages: Math.ceil(totalItems.value / 12) || 1,
  totalItems: totalItems.value,
  itemsPerPage: 12,
  pageOptions: [5, 12, 15, 20],
}))

onMounted(() => {
  setMaxVisiblePages(isWideScreen.value)
})
</script>

<template>
  <div class="narrow-container pb-20">
    <UiBreadcrumb
      :breadcrumbs="breadcrumbs"
      class="self-start mt-5 mb-5"
    />
    <h1
      v-if="route.query.search"
      class="font-bold typography-headline-3 md:typography-headline-2 mb-10"
    >
      Results for "{{ route.query.search }}"
    </h1>
    <div class="grid grid-cols-12 lg:gap-x-6">
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <CategoryFilterSidebar
          class="hidden lg:block"
          :attributes="organizedAttributes"
          :categories="categories"
        />
        <LazyCategoryMobileSidebar
          :is-open="isOpen"
          @close="close"
        >
          <template #default>
            <CategoryFilterSidebar
              class="block lg:hidden"
              :attributes="organizedAttributes"
              :categories="categories"
              @close="close"
            />
          </template>
        </LazyCategoryMobileSidebar>
      </div>
      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <template v-if="!loading">
          <div class="lg:hidden mb-6">
            <div class="flex gap-3">
              <CategorySortDropdown class="flex-1" />
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 border border-primary-900 rounded-md px-4 py-2.5 text-xs uppercase tracking-[0.1em] font-medium whitespace-nowrap"
                @click="open"
              >
                {{ $t('refineBy') }}
                <SfIconTune size="sm" />
              </button>
            </div>
            <p class="mt-4 text-sm text-primary-500">
              <span class="text-primary-900 font-semibold tabular-nums">{{ totalItems }}</span>
              {{ $t('products') }}
            </p>
          </div>

          <div class="hidden lg:flex justify-between items-center pb-4 mb-6 border-b border-neutral-200">
            <span class="text-sm text-primary-500">
              <span class="text-primary-900 font-semibold tabular-nums">{{ totalItems }}</span>
              {{ $t('products') }}
            </span>
            <CategorySortDropdown />
          </div>
          <section
            v-if="productTemplateList.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8"
          >
            <LazyUiProductCard
              v-for="productTemplate in productTemplateList"
              :key="productTemplate.id"
              :name="productTemplate?.name || ''"
              loading="eager"
              :slug="
                mountUrlSlugForProductVariant(
                  (productTemplate.firstVariant || productTemplate) as Product,
                )
              "
              :image-url="productTemplate.imageUrl ?? ''"
              :image-alt="productTemplate?.name || ''"
              :regular-price="
                getRegularPrice(productTemplate.firstVariant as Product) || 250
              "
              :special-price="
                getSpecialPrice(productTemplate.firstVariant as Product)
              "
              :rating-count="(productTemplate as any)?.ratingCount ?? 0"
              :rating="(productTemplate as any)?.ratingAvg ?? 0"
              :first-variant="productTemplate.firstVariant as Product"
            />
          </section>
          <CategoryEmptyState v-else />
          <LazyUiPagination
            v-if="pagination.totalPages > 1"
            class="mt-5"
            :current-page="pagination.currentPage"
            :total-items="pagination.totalItems"
            :page-size="pagination.itemsPerPage"
            :max-visible-pages="maxVisiblePages"
          />
        </template>
        <template v-else>
          <div class="w-full text-center">
            <SfLoaderCircular size="base" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
