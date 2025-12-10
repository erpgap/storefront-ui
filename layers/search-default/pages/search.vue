<script setup lang="ts">
import {
  SfButton,
  SfIconTune,
  useDisclosure,
  SfLoaderCircular,
} from '@storefront-ui/vue'
import { useRoute } from 'vue-router'

import { useProductTemplateList } from '../../product/composables/useProductTemplateList'
import { useProductAttributes } from '../../product/composables/useProductAttributes'
import { useUiHelpers } from '../../category/composables/useUiHelpers'
import { useNuxtApp } from 'nuxt/app'

type Product = { slug?: string; stock?: number; qty?: number;[k: string]: any }

const route = useRoute()
const { isOpen, open, close } = useDisclosure()

const {
  loading,
  totalItems,
  organizedAttributes,
  loadProductTemplateList,
  productTemplateList,
  stockCount,
} = useProductTemplateList(route.fullPath)

provide('stockCount', stockCount)

const { getFacetsFromURL } = useUiHelpers()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()
const { $getImage } = useNuxtApp()

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
  { name: 'Search', link: '/' },
]
</script>

<template>
  <div class="mx-auto w-full max-w-[1900px] px-12 md:px-20 xl:px-32 2xl:px-40 pb-20">
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
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold font-headings md:text-lg">
              {{ totalItems }} Products
            </span>
            <SfButton variant="tertiary" class="lg:hidden whitespace-nowrap" @click="open">
              <template #prefix>
                <SfIconTune />
              </template>
              Filter
            </SfButton>
          </div>

          <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            <LazyUiProductCard v-for="pt in productTemplateList" :key="pt.id" :name="pt?.name || ''" loading="eager"
              :slug="slugFor(pt)" :image-url="$getImage(String(pt.image), 370, 370, String(pt.imageFilename))"
              :image-alt="pt?.name || ''" :regular-price="getRegularPrice(pt.firstVariant as any)"
              :special-price="getSpecialPrice(pt.firstVariant as any)" :rating-count="123" :rating="Number(4)"
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
