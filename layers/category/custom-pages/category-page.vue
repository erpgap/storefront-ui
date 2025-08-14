<script setup lang="ts">
import { SfButton, SfIconTune, useDisclosure, SfLoaderCircular } from '@storefront-ui/vue'
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import type { Product } from '~/graphql'

const route = useRoute()

const cleanFullPath = computed(() => route?.fullPath?.replace(/\/$/, ''))

const { isOpen, open, close } = useDisclosure()
const {
  loadProductTemplateList,
  organizedAttributes,
  loading,
  productTemplateList,
  totalItems,
  stockCount,
} = useProductTemplateList(String(cleanFullPath.value))

provide('stockCount', stockCount)

const { loadCategory, category } = useCategory()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()
const { getFacetsFromURL } = useUiHelpers()

const maxVisiblePages = useState('category-max-visible-pages', () => 1)
const setMaxVisiblePages = (isWide: boolean) => (maxVisiblePages.value = isWide ? 5 : 1)

watch(isWideScreen, value => setMaxVisiblePages(value))
watch(isTabletScreen, (value) => {
  if (value && isOpen.value) {
    close()
  }
})

watch(
  () => route.query,
  async (newValue, oldValue) => {
    delete newValue['list-view']
    delete oldValue['list-view']

    if (!isEqual(oldValue, newValue)) {
      await loadProductTemplateList(getFacetsFromURL(route.query))
    }
  },
)

const pagination = computed(() => ({
  currentPage: route?.query?.page ? Number(route.query.page) : 1,
  totalPages: Math.ceil(totalItems.value / 20) || 1,
  totalItems: totalItems.value,
  itemsPerPage: 20,
  pageOptions: [5, 10, 15, 20],
}))

const seoData = computed(() => {
  if (category.value && Object.keys(category.value).length > 0) {
    return generateSeo<SeoEntity>(category.value, 'Category')
  }

  const fallbackEntity: SeoEntity = {
    name: 'Category',
    metaTitle: `Category | ${route.path.split('/').pop() || 'Products'}`,
    metaDescription: 'Browse our product categories',
  }

  return generateSeo<SeoEntity>(fallbackEntity, 'Category')
})

useHead(seoData)

watch(
  () => route.path,
  async (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      await loadCategory({ slug: String(newSlug) })
    }
  },
  { immediate: true },
)

setMaxVisiblePages(isWideScreen.value)

await loadProductTemplateList(getFacetsFromURL(route.query))
</script>

<template>
  <div class="pb-20">
    <UiBreadcrumb
      :breadcrumbs="category.breadcrumb"
      class="self-start mt-5 mb-5"
    />
    <div class="grid grid-cols-12 lg:gap-x-6">
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <LazyCategoryFilterSidebar
          v-if="$viewport.isGreaterOrEquals('desktopSmall')"
          :attributes="organizedAttributes"
          :categories="[]"
        />
        <LazyCategoryMobileSidebar
          v-if="$viewport.isLessThan('desktopSmall')"
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
      </div>
      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <div v-if="!loading">
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold font-headings md:text-lg">{{ totalItems }} Products
            </span>
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
              loading="eager"
              :slug="mountUrlSlugForProductVariant(
                (productTemplate.firstVariant || productTemplate) as Product,
              )
              "
              :image-url="
                $getImage(
                  String(productTemplate.image),
                  370,
                  370,
                  String(productTemplate.imageFilename),
                )
              "
              :image-alt="productTemplate?.name || ''"
              :regular-price="getRegularPrice(productTemplate.firstVariant as Product)
              "
              :special-price="getSpecialPrice(productTemplate.firstVariant as Product)
              "
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
