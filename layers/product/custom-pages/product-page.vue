<script setup lang="ts">
import {
  SfButton,
  SfChip,
  SfCounter,
  SfIconFavorite,
  SfIconFavoriteFilled,
  SfIconPackage,
  SfIconSafetyCheck,
  SfIconSell,
  SfIconShoppingCart,
  SfIconShoppingCartCheckout,
  SfIconWarehouse,
  SfLoaderCircular,
  SfRating,
} from '@storefront-ui/vue'
import type { CustomProductWithStockFromRedis, ImageGalleryItem, OrderLine } from '~~/graphql'
import generateSeo, { type SeoEntity } from '~~/app/utils/buildSEOHelper'
import { useProductGetters } from '~~/layers/product/composables/useProductGetters'
import { useProductTemplate } from '~~/layers/product/composables/useProductTemplate'
import { useProductVariant } from '~~/layers/product/composables/useProductVariant'
import { useProductVariantSelection } from '~~/layers/product/composables/useProductVariantSelection'
import {
  getCombinationIdsFromQuery,
  getValidAttributeValueIds,
  getVariantAxisNames,
  resolveCombinationIds,
} from '~~/layers/product/utils'

definePageMeta({ key: route => route.fullPath })

const route = useRoute()
const cleanPath = computed(() => route.path.replace(/\/$/, ''))

// Resolve the canonical URL here in setup (valid Nuxt context). The canonical
// drops the query string so variant params (e.g. ?Color=46) consolidate onto
// the product URL.
const { origin: reqOrigin, pathname: reqPathname } = useRequestURL()
const canonicalUrl = `${reqOrigin}${reqPathname}`

const {
  loadProductTemplate,
  productTemplate,
  loadingProductTemplate,
  breadcrumbs,
} = useProductTemplate(cleanPath.value)

const {
  loadProductVariant,
  productVariant,
  getRegularPrice,
  getSpecialPrice,
} = useProductVariant(cleanPath.value)

const { addProductToRecentViews } = useRecentViewProducts()
const { wishlistAddItem, isInWishlist, wishlistRemoveItem } = useWishlist()
const { cart, cartAdd } = useCart()

await loadProductTemplate({ slug: cleanPath.value })

// Reject URLs that reference an attribute value the product doesn't have
// (e.g. ?color=black-333) with a 404 instead of silently rendering a broken page.
if (productTemplate.value?.id) {
  const validIds = getValidAttributeValueIds(productTemplate.value)
  const requestedIds = getCombinationIdsFromQuery(
    route.query,
    getVariantAxisNames(productTemplate.value),
  )
  if (requestedIds.some(id => !validIds.has(id))) {
    throw createError({ statusCode: 404, statusMessage: 'Variant not found' })
  }
}

if (productTemplate.value?.id) {
  await loadProductVariant({
    productTemplateId: Number(productTemplate.value.id),
    combinationId: resolveCombinationIds(productTemplate.value, route.query),
  })
}

const { colorOptions, selectedValues, selectAxisValue } = useProductVariantSelection(
  productTemplate,
  combinationId =>
    loadProductVariant({
      productTemplateId: Number(productTemplate.value.id),
      combinationId,
    }),
)

const selectedColor = computed(() => selectedValues.value['Color'] ?? colorOptions.value[0]?.id ?? null)

const seoData = computed(() => {
  if (productVariant.value?.id) {
    const product = productVariant.value
    const seoEntity: SeoEntity = {
      ...product,
      metaTitle: product.metaTitle || product.name || 'Product',
      metaDescription: product.metaDescription || product.description || 'Check out this amazing product!',
      metaKeyword: product.metaKeyword || product.name,
    }
    return generateSeo(seoEntity, 'Product', canonicalUrl)
  }

  const fallbackEntity: SeoEntity = {
    name: 'Product',
    metaTitle: `Product | ${route.path.split('/').pop() || 'Store'}`,
    metaDescription: 'Check out this amazing product in our store',
    metaKeyword: 'Product',
  }
  return generateSeo(fallbackEntity, 'Product', canonicalUrl)
})
useHead(seoData)

const quantitySelectorValue = ref(1)

const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toDateString().slice(0, 10)
})

const productsInCart = computed(() => {
  if (!productVariant.value?.id) return 0
  return (
    cart.value?.order?.websiteOrderLine?.find(
      (line: OrderLine) => line.product?.id === productVariant.value.id,
    )?.quantity ?? 0
  )
})

const handleCartAdd = async () => {
  if (!productVariant.value?.id) return
  await cartAdd(productVariant.value.id, quantitySelectorValue.value)
}

const handleWishlistToggle = async () => {
  if (!productVariant.value?.id) return
  if (isInWishlist(productVariant.value.id as number)) {
    await wishlistRemoveItem(productVariant.value.id)
  }
  else {
    await wishlistAddItem(productVariant.value.id)
  }
}

onMounted(() => {
  if (productTemplate.value?.id) addProductToRecentViews(Number(productTemplate.value.id))
})

watch(
  () => productTemplate.value?.id,
  (id: number) => {
    if (id) addProductToRecentViews(Number(id))
  },
)

const { getMainImage, getThumbs } = useProductGetters(productTemplate, productVariant)
const mainImage = computed<ImageGalleryItem>(
  () => getMainImage(380, 505) ?? ({} as ImageGalleryItem),
)
const thumbs = computed<ImageGalleryItem[]>(() => getThumbs(200, 200) ?? [])

const selectedColorLabel = computed(
  () => colorOptions.value.find((c: any) => c.id === selectedColor.value)?.label ?? '',
)
const savings = computed(() => {
  const r = Number((getRegularPrice as any)?.value ?? getRegularPrice ?? 0)
  const s = Number((getSpecialPrice as any)?.value ?? getSpecialPrice ?? 0)
  return Math.max(0, r - s)
})
const ratingAvg = computed(() => Number((productVariant.value as any)?.ratingAvg ?? (productTemplate.value as any)?.ratingAvg ?? 0))
const ratingCount = computed(() => Number((productVariant.value as any)?.ratingCount ?? (productTemplate.value as any)?.ratingCount ?? 0))
const categoryEyebrow = computed(() => {
  // The product's first category from GraphQL, e.g. "Bags" for product 49.
  const first = productTemplate.value?.categories?.[0] as any
  return first?.name ?? ''
})
</script>

<template>
  <NuxtErrorBoundary>
    <div class="narrow-container">
      <UiBreadcrumb :breadcrumbs="breadcrumbs" class="mt-6 mb-8" />

      <div v-if="productTemplate?.id">
        <!-- Gallery + purchase -->
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <!-- Gallery + details -->
          <section class="lg:self-start">
            <div class="max-w-[560px] mx-auto lg:mx-0">
              <UiGallery :main-image="mainImage" :thumbs="thumbs" />
            </div>

            <!-- Details (under the gallery so the purchase card can stay sticky longer) -->
            <div v-if="productTemplate?.description" class="mt-12 lg:mt-16 max-w-[560px] mx-auto lg:mx-0">
              <h2 class="font-light tracking-[-0.01em] text-[clamp(22px,2.4vw,30px)] mb-4">
                {{ $t('productDetails') }}
              </h2>
              <p class="text-primary-600 font-light leading-relaxed">
                {{ productTemplate?.description }}
              </p>
            </div>
          </section>

          <!-- Purchase info -->
          <section
            class="mt-10 lg:mt-0 lg:sticky lg:top-32 lg:self-start h-fit"
            data-testid="purchase-card"
          >
            <p v-if="categoryEyebrow" class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3">
              {{ categoryEyebrow }}
            </p>
            <h1
              class="font-light tracking-[-0.02em] leading-tight text-[clamp(26px,3vw,38px)]"
              data-testid="product-name"
            >
              {{ productVariant?.name || productTemplate?.name }}
            </h1>

            <!-- Rating -->
            <div v-if="ratingCount > 0" class="inline-flex items-center gap-2 mt-3 text-[13px] text-primary-500">
              <SfRating size="xs" :value="Math.round(ratingAvg)" :max="5" />
              <span>({{ ratingAvg.toFixed(1) }})</span>
              <span class="text-primary-200">·</span>
              <span>{{ ratingCount }} reviews</span>
            </div>

            <!-- Price -->
            <div class="mt-5 min-h-[40px] flex items-baseline flex-wrap gap-x-3 gap-y-1">
              <template v-if="productVariant?.id">
                <template v-if="productVariant?.combinationInfoVariant?.has_discounted_price">
                  <span class="text-[24px] font-medium">{{ $currency(getSpecialPrice) }}</span>
                  <span class="text-[16px] text-primary-300 line-through">{{ $currency(getRegularPrice) }}</span>
                  <span class="text-[13px] text-primary-500">You save {{ $currency(savings) }}</span>
                </template>
                <span v-else class="text-[24px] font-medium">{{ $currency(getRegularPrice) }}</span>
              </template>
              <div v-else class="w-32 h-8 bg-primary-50 animate-pulse rounded-[2px]" />
            </div>

            <!-- Color variants -->
            <div v-if="colorOptions.length" class="mt-8" data-testid="product-properties">
              <p class="text-[12px] tracking-[0.16em] uppercase font-medium text-primary-400 mb-3">
                Color<span v-if="selectedColorLabel" class="text-black"> — {{ selectedColorLabel }}</span>
              </p>
              <fieldset class="flex flex-wrap gap-2.5">
                <button
                  v-for="color in colorOptions"
                  :key="color.id"
                  type="button"
                  :aria-pressed="color.id === selectedColor"
                  class="min-w-[64px] h-[42px] px-4 rounded-[2px] text-[12px] tracking-[0.06em] uppercase border transition-colors duration-200"
                  :class="color.id === selectedColor
                    ? 'border-black bg-primary-50 text-black font-medium'
                    : 'border-primary-200 text-primary-500 hover:border-primary-400 hover:text-black'"
                  @click="color.id !== selectedColor && selectAxisValue('Color', color.id, color.label)"
                >
                  {{ color.label }}
                </button>
              </fieldset>
            </div>

            <!-- Quantity -->
            <div class="mt-8">
              <p class="text-[12px] tracking-[0.16em] uppercase font-medium text-primary-400 mb-3">
                Quantity
              </p>
              <UiQuantitySelector
                v-model="quantitySelectorValue"
                :value="quantitySelectorValue"
                class="w-[140px]"
              />
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-3">
              <SfButton
                :disabled="loadingProductTemplate || !productVariant?.id"
                type="button"
                size="lg"
                class="flex-1 min-h-[54px] text-[13px] font-medium"
                @click="handleCartAdd"
              >
                {{ $t('addToCart') }}
              </SfButton>
              <SfButton
                v-if="productVariant"
                type="button"
                variant="tertiary"
                square
                :aria-label="isInWishlist(productVariant.id as number) ? $t('wishlist.removeFromWishlist') : $t('wishlist.addToWishlist')"
                class="min-h-[54px] w-[54px] shrink-0 !border !border-primary-200 !text-black hover:!border-black hover:!bg-transparent"
                @click="handleWishlistToggle"
              >
                <UiLineIcon name="heart" :filled="isInWishlist(productVariant.id as number)" :size="20" />
              </SfButton>
            </div>

            <p
              v-show="productsInCart"
              class="mt-3 flex items-center gap-1.5 text-[13px] text-primary-500"
            >
              <UiLineIcon name="cart" :size="16" />
              {{ productsInCart }} in your cart
            </p>

            <!-- Reassurance -->
            <p class="mt-7 pt-6 border-t border-primary-100 text-[13px] text-primary-500">
              Complimentary shipping over $150 · 30-day returns
            </p>
          </section>
        </div>
      </div>

      <!-- Recommendations -->
      <section v-if="!loadingProductTemplate && productTemplate?.frequentlyBoughtTogether" class="mt-24">
        <LazyProductSlider text="Recommended with this product" :product-template-list="productTemplate.frequentlyBoughtTogether" />
      </section>
      <section v-if="!loadingProductTemplate && productTemplate?.alternativeProducts" class="mb-10">
        <LazyProductSlider text="Alternative product" :product-template-list="productTemplate.alternativeProducts" />
      </section>
      <section class="mb-20">
        <ClientOnly>
          <LazyProductRecentViewSlider text="Your recent views" :exclude-id="Number(productTemplate?.id)" />
        </ClientOnly>
      </section>
    </div>

    <template #error>
      <div>
        <p class="mt-8 font-medium">
          {{ $t('emptyStateText') }}
        </p>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>
