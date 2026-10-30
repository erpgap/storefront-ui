<script setup lang="ts">
import {
  SfButton,
  SfIconTune,
  useDisclosure,
  SfLoaderCircular,
} from '@storefront-ui/vue'

import type { LocationQuery } from 'vue-router'
import { useProductTemplateList } from '../../product/composables/useProductTemplateList'
import { useUiHelpers } from '../../category/composables/useUiHelpers'
import { useScrollToTopOnListingChange } from '../../core/composables/useScrollToTopOnListingChange'
import { sortByIds, useAlgolia } from '../composables/useAlgolia'
import type { ProductFilterInput, QueryProductsArgs } from '~~/graphql'

const route = useRoute()
const { t } = useI18n()

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

const nuxtApp = useNuxtApp()
const { productIds } = useAlgolia()
// The products Algolia matched, best first, when it chose them.
const algoliaIds = ref<number[] | null>(null)

async function fetchList(q: LocationQuery) {
  const facets: QueryProductsArgs = getFacetsFromURL(q)
  const term = String(q.search ?? '')

  // Algolia decides what matches; Odoo then filters, sorts and pages those
  // products like any other listing. 1000 is as many hits as Algolia returns.
  const ids = term ? await productIds(term, 1000) : null
  algoliaIds.value = ids
  if (ids) {
    // No match must show nothing, and an empty list would mean "no filter".
    facets.filter = { ...facets.filter, ids: ids.length ? ids : [0] } as ProductFilterInput
    facets.search = undefined
  }
  else if (term) {
    facets.search = term
  }
  // After awaiting Algolia, setup's Nuxt context is gone on the server, and
  // the product query needs it.
  await nuxtApp.runWithContext(() => loadProductTemplateList(facets))
}

// Odoo pages through Algolia's matches in its own order. Unless the shopper
// chose a sort, show each page best match first.
const results = computed(() => {
  const list = productTemplateList.value ?? []
  return algoliaIds.value && !route.query.sort ? sortByIds(list, algoliaIds.value) : list
})

onServerPrefetch(() => fetchList(route.query))

if (import.meta.client) {
  watch(
    () => route.query,
    (q) => { fetchList(q) },
    { immediate: true, deep: true },
  )
}

const breadcrumbs = [
  { name: t('home'), link: '/' },
  { name: t('search'), link: '/search' },
]
</script>

<template>
  <div class="narrow-container pb-20">
    <UiBreadcrumb
      :breadcrumbs="breadcrumbs"
      class="self-start mt-5 mb-5"
    />

    <h1
      v-if="route.query?.search"
      class="font-bold typography-headline-3 md:typography-headline-2 mb-10"
    >
      {{ $t('resultsFor', { phrase: route.query.search }) }}
    </h1>

    <div class="grid grid-cols-12 lg:gap-x-6">
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <ClientOnly>
          <template #fallback>
            <div class="p-4 text-sm text-neutral-500">
              {{ $t('core.search.loadingFilters') }}
            </div>
          </template>
          <CategoryFilterSidebar
            v-if="$viewport.isGreaterOrEquals('desktopSmall')"
            class="block"
            :attributes="organizedAttributes"
            :categories="[]"
          />
        </ClientOnly>

        <ClientOnly>
          <LazyCategoryMobileSidebar
            :is-open="isOpen"
            @close="close"
          >
            <template #default>
              <CategoryFilterSidebar
                class="block lg:hidden"
                :attributes="organizedAttributes"
                :categories="[]"
                @close="close"
              />
            </template>
          </LazyCategoryMobileSidebar>
        </ClientOnly>
      </div>

      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <div
          v-if="loading"
          class="w-full text-center"
        >
          <SfLoaderCircular
            size="xl"
            class="mt-[160px]"
          />
        </div>

        <div v-else-if="results.length > 0">
          <div class="lg:hidden mb-6">
            <div class="flex gap-3">
              <CategorySortDropdown class="flex-1" />
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 border border-primary-900 rounded-md px-4 py-2.5 text-xs uppercase tracking-widest font-medium whitespace-nowrap"
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
            <LazyUiProductCard
              v-for="product in results"
              :key="product.id"
              v-bind="productCardProps(product)"
              loading="eager"
            />
          </section>

          <LazyUiPagination
            v-if="(Number(totalItems) || 0) > 12"
            class="mt-5"
            :current-page="Number(route?.query?.page || 1)"
            :total-items="Number(totalItems) || 0"
            :page-size="12"
            :max-visible-pages="5"
          />
        </div>

        <CategoryEmptyState
          v-else
          :page="Number(route?.query?.page || 1)"
        />
      </div>
    </div>
  </div>
</template>
