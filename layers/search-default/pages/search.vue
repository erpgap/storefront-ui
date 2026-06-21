<script setup lang="ts">
import {
  SfButton,
  SfIconTune,
  useDisclosure,
  SfLoaderCircular,
} from '@storefront-ui/vue'

import { useProductTemplateList } from '../../product/composables/useProductTemplateList'
import { useProductAttributes } from '../../product/composables/useProductAttributes'
import { useUiHelpers } from '../../category/composables/useUiHelpers'
import { useScrollToTopOnListingChange } from '../../core/composables/useScrollToTopOnListingChange'

type Product = { slug?: string; stock?: number; qty?: number;[k: string]: any }

const route = useRoute()

// A bare /search with no query term has nothing to show — send users to the
// full catalog instead.
if (!String(route.query.search ?? '').trim()) {
  await navigateTo('/products', { redirectCode: 301 })
}

const { isOpen, open, close } = useDisclosure()

const {
  loading,
  totalItems,
  organizedAttributes,
  loadProductTemplateList,
  productTemplateList,
  stockCount,
} = useProductTemplateList(route.fullPath)

useScrollToTopOnListingChange(loading)

provide('stockCount', stockCount)

const { getFacetsFromURL } = useUiHelpers()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const slugFor = (pt: any) => pt?.firstVariant?.slug || pt?.slug || ''

type ProductWithStock = Product & { stock: number }
function normalizeVariant(p?: Product): ProductWithStock | undefined {
  if (!p) return undefined
  return { ...p, stock: Number((p as any)?.stock ?? (p as any)?.qty ?? 0) }
}

async function fetchList(q: Record<string, any>) {
  const facets: Record<string, any> = getFacetsFromURL(q) || {}
  if (q?.search) facets.search = String(q.search)
  await loadProductTemplateList(facets)
}


onServerPrefetch(() => fetchList(route.query))

if (import.meta.client) {
  watch(
    () => route.query,
    (q: Record<string, any>) => { fetchList(q) },
    { immediate: true, deep: true }
  )
}

const safeAttributes = computed(() =>
  Array.isArray((organizedAttributes as any)?.value)
    ? (organizedAttributes as any).value
    : []
)


const breadcrumbs = [
  { name: 'Home', link: '/' },
  { name: 'Search', link: '/search' },
]
</script>

<template>
  <div class="narrow-container pb-20">
    <UiBreadcrumb :breadcrumbs="breadcrumbs" class="self-start mt-5 mb-5" />

    <h1 v-if="route.query?.search" class="font-bold typography-headline-3 md:typography-headline-2 mb-10">
      Results for "{{ route.query.search }}"
    </h1>

    <div class="grid grid-cols-12 lg:gap-x-6">

      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <ClientOnly>
          <template #fallback>
            <div class="p-4 text-sm text-neutral-500">Loading filters...</div>
          </template>
          <CategoryFilterSidebar v-if="$viewport.isGreaterOrEquals('desktopSmall')" class="block"
            :attributes="safeAttributes" :categories="[]" />
        </ClientOnly>

        <ClientOnly>
          <LazyCategoryMobileSidebar :is-open="isOpen" @close="close">
            <template #default>
              <CategoryFilterSidebar class="block lg:hidden" :attributes="safeAttributes" :categories="[]"
                @close="close" />
            </template>
          </LazyCategoryMobileSidebar>
        </ClientOnly>
      </div>

      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <div v-if="loading" class="w-full text-center">
          <SfLoaderCircular size="xl" class="mt-[160px]" />
        </div>

        <div v-else-if="Array.isArray(productTemplateList) && productTemplateList.length > 0">
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

          <section class="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8">
            <LazyUiProductCard v-for="pt in productTemplateList" :key="pt.id" :name="pt?.name || ''" loading="eager"
              :slug="slugFor(pt)" :image-url="pt.imageUrl ?? ''"
              :image-alt="pt?.name || ''" :regular-price="getRegularPrice(pt.firstVariant as any)"
              :special-price="getSpecialPrice(pt.firstVariant as any)"
              :rating-count="(pt as any)?.ratingCount ?? 0" :rating="(pt as any)?.ratingAvg ?? 0"
              :first-variant="normalizeVariant(pt.firstVariant as any)" />
          </section>

          <LazyUiPagination v-if="(Number(totalItems) || 0) > 12" class="mt-5"
            :current-page="Number(route?.query?.page || 1)" :total-items="Number(totalItems) || 0" :page-size="12"
            :max-visible-pages="5" />
        </div>

        <CategoryEmptyState v-else :page="Number(route?.query?.page || 1)" />
      </div>
    </div>
  </div>
</template>
