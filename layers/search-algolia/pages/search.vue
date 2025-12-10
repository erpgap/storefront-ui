<script setup lang="ts">
import { SfButton, SfIconTune, SfLoaderCircular, useDisclosure } from '@storefront-ui/vue'
import type { Product } from '~/graphql'

const route = useRoute()
const { isOpen, open, close } = useDisclosure()

const { getFacetsFromURL } = useUiHelpers()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const {
  loadProductTemplateList,
  organizedAttributes,
  productTemplateList,
  totalItems,
  stockCount,
  loading,
} = useProductTemplateList(route.fullPath)

provide('stockCount', stockCount)

// Breadcrumbs
const breadcrumbs = [
  { name: 'Home', link: '/' },
  { name: 'Search', link: '/' },
]

// ————————————————— Helpers —————————————————
type ProductWithStock = Product & { stock: number }
function normalizeVariant(p?: Product): ProductWithStock | undefined {
  if (!p) return undefined
  return {
    ...p,
    stock: Number((p as any)?.stock ?? (p as any)?.qty ?? 0),
  }
}

async function fetchList(q: Record<string, any>) {
  // monta as variáveis para o composable a partir da URL
  const facets = getFacetsFromURL(q) || {}
  if (q.search) facets.search = q.search
  await loadProductTemplateList(facets)
}

await fetchList(route.query)

watch(
  () => route.fullPath,
  async () => {
    await fetchList(route.query)
  }
)

const maxVisiblePages = useState('search-page-max-visible', () => 1)
const setMaxVisiblePages = (isWide: boolean) =>
  (maxVisiblePages.value = isWide ? 5 : 1)

watch(isWideScreen, (value: boolean) => setMaxVisiblePages(value))
watch(isTabletScreen, (value: any) => value && isOpen.value && close())

const pagination = computed(() => ({
  currentPage: route?.query?.page ? Number(route.query.page) : 1,
  totalPages: Math.ceil((totalItems.value || 0) / 12) || 1,
  totalItems: totalItems.value || 0,
  itemsPerPage: 12,
  pageOptions: [5, 12, 15, 20],
}))

onMounted(() => setMaxVisiblePages(isWideScreen.value))
</script>

<template>

    <div class="pb-20"></div>
    <UiBreadcrumb :breadcrumbs="breadcrumbs" class="self-start mt-5 mb-5" />

    <h1 v-if="route.query.search" class="font-bold typography-headline-3 md:typography-headline-2 mb-10">
      Results for "{{ route.query.search }}" 
    </h1>

    <div class="grid grid-cols-12 lg:gap-x-6">
      <!-- Lateral (filtros) -->
      <div class="col-span-12 lg:col-span-4 xl:col-span-3">
        <CategoryFilterSidebar class="hidden lg:block" :attributes="(organizedAttributes as any)" :categories="[]" />
        <LazyCategoryMobileSidebar :is-open="isOpen" @close="close">
          <template #default>
            <CategoryFilterSidebar class="block lg:hidden" :attributes="(organizedAttributes as any)" :categories="[]"
              @close="close" />
          </template>
        </LazyCategoryMobileSidebar>
      </div>

      <!-- Grid de produtos -->
      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <template v-if="!loading">
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

          <section v-if="Array.isArray(productTemplateList) && productTemplateList.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            <LazyUiProductCard v-for="pt in productTemplateList" :key="pt.id" :name="pt?.name || ''" loading="eager"
              :slug="mountUrlSlugForProductVariant((pt.firstVariant || pt) as Product)"
              :image-url="$getImage(String(pt.image), 370, 370, String(pt.imageFilename))" :image-alt="pt?.name || ''"
              :regular-price="getRegularPrice(pt.firstVariant as Product) || 250"
              :special-price="getSpecialPrice(pt.firstVariant as Product)" :rating-count="123" :rating="Number(4)"
              :first-variant="normalizeVariant(pt.firstVariant as Product)" />
          </section>

          <CategoryEmptyState v-else />

          <LazyUiPagination v-if="pagination.totalPages > 1" class="mt-5" :current-page="pagination.currentPage"
            :total-items="pagination.totalItems" :page-size="pagination.itemsPerPage"
            :max-visible-pages="maxVisiblePages" />
        </template>

        <template v-else>
          <div class="w-full text-center">
            <SfLoaderCircular size="base" />
          </div>
        </template>
      </div>
    </div>
</template>

