<script setup lang="ts">
import { SfButton, SfIconTune, useDisclosure } from '@storefront-ui/vue'
import { useProductAttributes } from '~~/layers/product/composables/useProductAttributes'
import { useProductTemplateList } from '~~/layers/product/composables/useProductTemplateList'
import { useScrollToTopOnListingChange } from '~~/layers/core/composables/useScrollToTopOnListingChange'
import generateSeo, { type SeoEntity } from '~~/app/utils/buildSEOHelper'
import type { Product } from '~~/graphql'

type Breadcrumb = { label: string; link: string }

const props = withDefaults(
  defineProps<{
    breadcrumbs?: Breadcrumb[]
    heading?: string
    description?: string
    seoEntity?: SeoEntity | null
    itemsPerPage?: number
    stateKey?: string
    defaultSort?: string
  }>(),
  {
    breadcrumbs: () => [],
    heading: '',
    description: '',
    seoEntity: null,
    itemsPerPage: 18,
    stateKey: 'product-listing',
    defaultSort: '',
  },
)

const route = useRoute()
const { isOpen, open, close } = useDisclosure()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const {
  loadProductTemplateList,
  organizedAttributes,
  loading,
  status,
  productTemplateList,
  totalItems,
  stockCount,
  minPrice,
  maxPrice,
} = useProductTemplateList(route.fullPath.replace(/\/$/, ''), props.itemsPerPage, props.defaultSort)

useScrollToTopOnListingChange(loading)

provide('stockCount', stockCount)

const maxVisiblePages = useState(`${props.stateKey}-max-visible-pages`, () => 1)
const setMaxVisiblePages = (wide: boolean) => { maxVisiblePages.value = wide ? 5 : 1 }

watch(isWideScreen, setMaxVisiblePages)
watch(isTabletScreen, (isTablet: boolean) => { if (isTablet && isOpen.value) close() })

const attributes = computed(() =>
  Array.isArray(organizedAttributes.value) ? organizedAttributes.value : [],
)

const currentPage = computed(() => Number(route.query.page) || 1)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage) || 1)

// The API returns the category price range (min/maxPrice) for most categories,
// but not all. When it's missing, derive a sensible range from the loaded
// products' prices so the slider still spans real values instead of 0–2000.
const derivedPrices = computed(() =>
  productTemplateList.value
    .map((p: any) => Number(getSpecialPrice((p.firstVariant ?? p) as Product)) || 0)
    .filter((n: number) => n > 0),
)
// Use the API range only when it's a valid span; some categories return 0/0
// (or null), in which case we derive from the products on the page.
const hasApiRange = computed(() =>
  minPrice.value != null && maxPrice.value != null && Number(maxPrice.value) > Number(minPrice.value),
)
const effectiveMinPrice = computed(() =>
  hasApiRange.value ? minPrice.value : (derivedPrices.value.length ? Math.min(...derivedPrices.value) : null),
)
const effectiveMaxPrice = computed(() =>
  hasApiRange.value ? maxPrice.value : (derivedPrices.value.length ? Math.max(...derivedPrices.value) : null),
)

if (props.seoEntity) {
  const { origin, pathname } = useRequestURL()
  useHead(generateSeo<SeoEntity>(props.seoEntity, 'Category', `${origin}${pathname}`))
}

setMaxVisiblePages(isWideScreen.value)

// On the client's first render the listing is already in the SSR payload, so
// only fetch when we don't have it yet (server render, or client-side
// navigation to a different listing). This avoids a duplicate Odoo query on
// every page load. Filter/sort/page changes still refetch via the composable's
// `watch`.
if (status.value !== 'success') {
  await loadProductTemplateList()
}

// A requested page beyond the available range (e.g. /men?page=4 when there are
// fewer pages) is a URL that doesn't exist — return a 404 instead of an empty
// listing. Page 1 is always valid, so a genuinely empty result (no products /
// filtered to zero) still renders the empty state.
if (currentPage.value > totalPages.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

defineExpose({ totalItems, loading, loadProductTemplateList })
</script>

<template>
  <div class="narrow-container pb-20">
    <UiBreadcrumb
      v-if="breadcrumbs.length"
      :breadcrumbs="breadcrumbs"
      class="self-start mt-5 mb-5"
    />
    <div
      v-if="heading || description"
      class="mb-10"
    >
      <h1
        v-if="heading"
        class="font-bold typography-headline-3 md:typography-headline-2"
      >
        {{ heading }}
      </h1>
      <p
        v-if="description"
        class="mt-4 max-w-[56ch] text-primary-500 font-light leading-relaxed"
      >
        {{ description }}
      </p>
    </div>

    <div class="grid grid-cols-12 lg:gap-x-6">
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <!-- Show/hide via CSS, NOT v-if on $viewport. nuxt-viewport's
             fallbackBreakpoint is "desktop", so SSR renders this desktop
             sidebar; a mobile client with v-if would DELETE it on hydration,
             shifting the whole grid up (~0.85 CLS). `hidden lg:block` keeps the
             SSR and client DOM identical — visibility is pure CSS. -->
        <LazyCategoryFilterSidebar
          class="hidden lg:block"
          :attributes="attributes"
          :categories="[]"
          :min-price="effectiveMinPrice"
          :max-price="effectiveMaxPrice"
        />
        <LazyCategoryMobileSidebar
          class="lg:hidden"
          :is-open="isOpen"
          @close="close"
        >
          <template #default>
            <LazyCategoryFilterSidebar
              :attributes="attributes"
              :categories="[]"
              :min-price="effectiveMinPrice"
              :max-price="effectiveMaxPrice"
              @close="close"
            />
          </template>
        </LazyCategoryMobileSidebar>
      </div>

      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
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

        <!-- Keep the grid MOUNTED during a refetch (useAsyncData retains the
             previous items) and just dim it. Swapping the whole grid for a
             centered spinner collapsed the column height and back, causing a
             ~0.85 CLS. First row is eager so the LCP image isn't lazy. -->
        <div :class="['transition-opacity duration-200', loading ? 'opacity-50 pointer-events-none' : '']">
          <section
            v-if="productTemplateList.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 gap-5"
          >
            <LazyUiProductCard
              v-for="(product, i) in productTemplateList"
              :key="product.id"
              :name="product.name ?? ''"
              :slug="mountUrlSlugForProductVariant((product.firstVariant ?? product) as Product)"
              :image-url="product.imageUrl ?? ''"
              :image-alt="product.name ?? ''"
              :loading="i < 6 ? 'eager' : 'lazy'"
              :regular-price="getRegularPrice(product.firstVariant as Product)"
              :special-price="getSpecialPrice(product.firstVariant as Product)"
              :rating-count="(product as any)?.ratingCount ?? 0"
              :rating="(product as any)?.ratingAvg ?? 0"
              :first-variant="product.firstVariant as Product"
            />
          </section>

          <CategoryEmptyState
            v-else
            :page="currentPage"
          />

          <LazyUiPagination
            v-if="totalPages > 1"
            class="mt-5"
            :current-page="currentPage"
            :total-items="totalItems"
            :page-size="itemsPerPage"
            :max-visible-pages="maxVisiblePages"
          />
        </div>
      </div>
    </div>
  </div>
</template>
