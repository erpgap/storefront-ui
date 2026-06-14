<script setup lang="ts">
import { SfButton, SfIconTune, useDisclosure, SfLoaderCircular } from '@storefront-ui/vue'
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
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const {
  loadProductTemplateList,
  organizedAttributes,
  loading,
  productTemplateList,
  totalItems,
  stockCount,
} = useProductTemplateList(route.fullPath.replace(/\/$/, ''), props.itemsPerPage)

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

if (props.seoEntity) {
  const { origin, pathname } = useRequestURL()
  useHead(generateSeo<SeoEntity>(props.seoEntity, 'Category', `${origin}${pathname}`))
}

setMaxVisiblePages(isWideScreen.value)

await loadProductTemplateList()

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
          :attributes="attributes"
          :categories="[]"
        />
        <LazyCategoryMobileSidebar
          v-else
          :is-open="isOpen"
          @close="close"
        >
          <template #default>
            <LazyCategoryFilterSidebar
              :attributes="attributes"
              :categories="[]"
              @close="close"
            />
          </template>
        </LazyCategoryMobileSidebar>
      </div>

      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <template v-if="!loading">
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
              v-for="product in productTemplateList"
              :key="product.id"
              :name="product.name ?? ''"
              :slug="mountUrlSlugForProductVariant((product.firstVariant ?? product) as Product)"
              :image-url="product.imageUrl ?? ''"
              :image-alt="product.name ?? ''"
              :regular-price="getRegularPrice(product.firstVariant as Product)"
              :special-price="getSpecialPrice(product.firstVariant as Product)"
              :rating-count="123"
              :rating="4"
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
        </template>

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
