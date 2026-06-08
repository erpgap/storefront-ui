<script setup lang="ts">
import { SfButton, SfIconTune, useDisclosure, SfLoaderCircular } from '@storefront-ui/vue'
import { isEqual } from 'lodash-es'
import { useRoute } from 'vue-router'
import { useUiHelpers } from '~~/layers/category/composables/useUiHelpers'
import { useProductAttributes } from '~~/layers/product/composables/useProductAttributes'
import { useProductTemplateList } from '~~/layers/product/composables/useProductTemplateList'
import { useState } from 'nuxt/app'
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import type { Product } from '~~/graphql'

type Breadcrumb = { label: string, link: string }

const props = withDefaults(
  defineProps<{
    breadcrumbs?: Breadcrumb[]
    heading?: string
    seoEntity?: SeoEntity | null
    itemsPerPage?: number
    stateKey?: string
  }>(),
  {
    breadcrumbs: () => [],
    heading: '',
    seoEntity: null,
    itemsPerPage: 20,
    stateKey: 'product-listing',
  },
)

const route = useRoute()
const { isOpen, open, close } = useDisclosure()
const { getFacetsFromURL } = useUiHelpers()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const {
  loadProductTemplateList,
  organizedAttributes,
  loading,
  productTemplateList,
  totalItems,
  stockCount,
} = useProductTemplateList(String(route.fullPath.replace(/\/$/, '')), props.itemsPerPage)

provide('stockCount', stockCount)

const maxVisiblePages = useState(`${props.stateKey}-max-visible-pages`, () => 1)
const setMaxVisiblePages = (isWide: boolean) => (maxVisiblePages.value = isWide ? 5 : 1)

watch(isWideScreen, (value: boolean) => setMaxVisiblePages(value))
watch(isTabletScreen, (value: boolean) => {
  if (value && isOpen.value) {
    close()
  }
})

watch(
  () => route.query,
  async (newValue: Record<string, any>, oldValue: Record<string, any>) => {
    const cleanNew = { ...newValue }
    const cleanOld = { ...oldValue }
    delete cleanNew['list-view']
    delete cleanOld['list-view']

    if (!isEqual(cleanOld, cleanNew)) {
      await loadProductTemplateList(getFacetsFromURL(route.query, [], props.itemsPerPage))
    }
  },
)

const safeAttributes = computed(() =>
  Array.isArray(organizedAttributes.value) ? organizedAttributes.value : [],
)

const pagination = computed(() => {
  const itemsPerPage = props.itemsPerPage
  const totalPages = Math.ceil(totalItems.value / itemsPerPage) || 1
  return {
    currentPage: Number(route.query.page) || 1,
    totalPages,
    totalItems: totalItems.value,
    itemsPerPage,
    pageOptions: [5, 10, 15, 20],
  }
})

if (props.seoEntity) {
  useHead(generateSeo<SeoEntity>(props.seoEntity, 'Category'))
}

setMaxVisiblePages(isWideScreen.value)

await loadProductTemplateList(getFacetsFromURL(route.query, [], props.itemsPerPage))

defineExpose({ totalItems, loading, loadProductTemplateList })
</script>

<template>
  <div class="narrow-container pb-20">
    <UiBreadcrumb
      v-if="breadcrumbs.length"
      :breadcrumbs="breadcrumbs"
      class="self-start mt-5 mb-5"
    />
    <h1
      v-if="heading"
      class="font-bold typography-headline-3 md:typography-headline-2 mb-10"
    >
      {{ heading }}
    </h1>
    <div class="grid grid-cols-12 lg:gap-x-6">
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <LazyCategoryFilterSidebar
          v-if="$viewport.isGreaterOrEquals('desktopSmall')"
          :attributes="safeAttributes"
          :categories="[]"
        />
        <LazyCategoryMobileSidebar
          v-if="$viewport.isLessThan('desktopSmall')"
          :is-open="isOpen"
          @close="close"
        >
          <template #default>
            <LazyCategoryFilterSidebar
              class="block lg:hidden"
              :attributes="safeAttributes"
              :categories="[]"
              @close="close"
            />
          </template>
        </LazyCategoryMobileSidebar>
      </div>
      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <div v-if="!loading">
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold font-headings md:text-lg">{{ totalItems }} Products</span>
            <SfButton
              variant="tertiary"
              class="lg:hidden whitespace-nowrap"
              @click="open"
            >
              <template #prefix>
                <SfIconTune />
              </template>
              Filter
            </SfButton>
          </div>
          <section
            v-if="productTemplateList.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-8"
          >
            <LazyUiProductCard
              v-for="productTemplate in productTemplateList"
              :key="productTemplate.id"
              :name="productTemplate?.name || ''"
              :slug="mountUrlSlugForProductVariant(productTemplate as Product)"
              :image-url="productTemplate.imageUrl ?? ''"
              :image-alt="productTemplate.name ?? ''"
              :regular-price="getRegularPrice(productTemplate.firstVariant as Product)"
              :special-price="getSpecialPrice(productTemplate.firstVariant as Product)"
              :rating-count="123"
              :rating="Number(4)"
              :first-variant="productTemplate.firstVariant as Product"
            />
          </section>
          <CategoryEmptyState
            v-else
            :page="pagination.currentPage"
          />
          <LazyUiPagination
            v-if="pagination.totalPages > 1"
            class="mt-5"
            :current-page="pagination.currentPage"
            :total-items="pagination.totalItems"
            :page-size="pagination.itemsPerPage"
            :max-visible-pages="maxVisiblePages"
          />
        </div>
        <div
          v-else
          class="w-full text-center"
        >
          <SfLoaderCircular
            size="xl"
            class="mt-[160px]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
