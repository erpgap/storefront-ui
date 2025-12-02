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
  SfLink,
  SfLoaderCircular,
  SfRating,
} from '@storefront-ui/vue';
import type { LocationQueryRaw } from 'vue-router';
import type { ImageGalleryItem, OrderLine, Product } from '~/graphql';
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper';
import { useProductGetters } from '~/layers/product/composables/useProductGetters';
import { useProductTemplate } from '~/layers/product/composables/useProductTemplate';
import { useProductVariant } from '~/layers/product/composables/useProductVariant';

const route = useRoute();
const cleanPath = computed(() => route?.path?.replace(/\/$/, ''));
const cleanFullPath = computed(() => route?.fullPath?.replace(/\/$/, ''));

const {
  loadProductTemplate,
  productTemplate,
  loadingProductTemplate,
  getAllColors,
  breadcrumbs,
} = useProductTemplate(cleanPath.value);

const {
  loadProductVariant,
  loadingProductVariant,
  productVariant,
  getRegularPrice,
  getSpecialPrice,
} = useProductVariant(cleanFullPath.value);

const { addProductToRecentViews } = useRecentViewProducts();
const { wishlistAddItem, isInWishlist, wishlistRemoveItem } = useWishlist();
const { cart, cartAdd } = useCart();

useHead(generateSeo<SeoEntity>(productVariant.value || productTemplate.value, 'Product'));

const templateColorsSnapshot = ref<any[]>([]);
const originalTemplateId = ref<number | null>(null);

watch(cleanPath, () => {
  templateColorsSnapshot.value = [];
  originalTemplateId.value = null;
});

watch(
  () => (getAllColors as any)?.value,
  (newColors: string | any[]) => {
    if (
      !templateColorsSnapshot.value.length &&
      Array.isArray(newColors) &&
      newColors.length
    ) {
      templateColorsSnapshot.value = newColors;
    }
  },
  { immediate: true },
);

const colorOptions = computed(() => {
  if (templateColorsSnapshot.value.length) {
    return templateColorsSnapshot.value.map((c: any) => ({
      id: Number(c.value ?? c.id),
      label: c.label ?? c.name,
    }));
  }

  const variant = productVariant.value as any;
  const attrs = Array.isArray(variant?.attributeValues)
    ? variant.attributeValues
    : [];

  if (attrs.length) {
    return attrs.map((av: any) => ({
      id: Number(av.id),
      label: av.name,
    }));
  }

  return [];
});

const selectedColor = computed(() => {
  if (route.query.Color) return Number(route.query.Color);
  return colorOptions.value?.[0]?.id ?? null;
});

const quantitySelectorValue = ref(1);

const updateFilter = async (filter: LocationQueryRaw | undefined) => {
  const query: LocationQueryRaw = {};

  if (selectedColor.value && selectedColor.value !== 0) {
    query.Color = selectedColor.value;
  }

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query[encodeURIComponent(key)] = value;
    });
  }

  await navigateTo({ query });
};

const tomorrow = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toDateString().slice(0, 10);
});

const productsInCart = computed(() => {
  if (!productVariant.value?.id) return 0;
  return (
    cart.value?.order?.websiteOrderLine?.find(
      (orderLine: OrderLine) => orderLine.product?.id === productVariant.value.id,
    )?.quantity || 0
  );
});

const handleCartAdd = async () => {
  if (!productVariant.value?.id) return;
  await cartAdd(productVariant.value.id, quantitySelectorValue.value);
};

const handleWishlistAddItem = async () => {
  if (!productVariant.value?.id) return;
  await wishlistAddItem(productVariant.value.id);
};

const handleWishlistRemoveItem = async () => {
  if (!productVariant.value?.id) return;
  await wishlistRemoveItem(productVariant.value.id);
};

watch(
  productTemplate,
  async (newValue: { id: any }, oldValue: any) => {
    if (!newValue?.id) {
      return;
    }

    if (!originalTemplateId.value) {
      originalTemplateId.value = Number(newValue.id);
    }

    addProductToRecentViews(Number(newValue.id));

    if (!productVariant.value?.id) {
      const hasColors = getAllColors?.value?.length > 0;

      if (hasColors) {
        const routeColor = route.query.Color;
        const fallbackColor = getAllColors?.value?.[0]?.value;

        const colorId = routeColor ? Number(routeColor) : fallbackColor;

        if (!colorId) return;

        await loadProductVariant({
          productTemplateId: originalTemplateId.value,
          combinationId: [colorId],
        });
      } else {
        await loadProductVariant({
          productTemplateId: originalTemplateId.value,
          combinationId: [],
        });
      }
    }
  },
  { immediate: true },
);

watch(
  () => route.query.Color,
  async (colorId: any) => {
    if (!originalTemplateId.value) {
      return;
    }

    const combinationId = Number(colorId);
    if (!combinationId) {
      return;
    }

    await loadProductVariant({
      productTemplateId: originalTemplateId.value,
      combinationId: [combinationId],
    });
  },
);

const { getMainImage, getThumbs } = useProductGetters(productTemplate, productVariant);
const mainImage = computed<ImageGalleryItem>(
  () => getMainImage(380, 505) || ({} as ImageGalleryItem),
);
const thumbs = computed<ImageGalleryItem[]>(() => getThumbs(200, 200) || []);

await loadProductTemplate({ slug: cleanPath.value });

const isLoadingPage = computed(
  () => loadingProductTemplate.value || loadingProductVariant.value,
);

const hasProductData = computed(
  () => !!productTemplate.value?.id && !!productVariant.value?.id,
);
</script>



<template>
  <NuxtErrorBoundary>
    <div class="narrow-container">
      <UiBreadcrumb :breadcrumbs="breadcrumbs" class="self-start mt-5 mb-10" />
      <div v-if="isLoadingPage" class="w-full flex flex-col items-center justify-center min-h-[60vh]">
        <SfLoaderCircular size="xl" class="my-32" />
      </div>
      <div v-else-if="hasProductData" class="md:grid grid-areas-product-page grid-cols-product-page gap-x-6">
        <section class="grid-in-left-top md:h-full xl:max-h-[500px]">
          <LazyUiGallery :main-image="mainImage" :thumbs="thumbs" />
        </section>
        <section class="col-span-5 grid-in-right md:mb-0">
          <div class="p-6 xl:p-6 md:border md:border-neutral-100 md:shadow-lg md:rounded-md md:sticky md:top-20"
            data-testid="purchase-card">
            <h1 class="mb-1 font-bold typography-headline-4" data-testid="product-name">
              {{ productVariant?.name }}
            </h1>
            <div v-if="productVariant?.combinationInfoVariant?.has_discounted_price" class="my-1">
              <div
                class="inline-flex items-center justify-center font-medium rounded-none bg-secondary-800 text-sm p-1.5 gap-1 mb-4">
                <SfIconSell color="white" size="sm" class="mr-1" />
                <span class="mr-1 text-white">{{ $t(`sale`) }}</span>
              </div>
              <span class="mr-2 text-black font-bold font-headings text-2xl" data-testid="price">
                {{ $currency(getSpecialPrice) }}
              </span>
              <span class="text-base font-normal text-neutral-500 line-through">
                {{ $currency(getRegularPrice) }}
              </span>
            </div>
            <div v-else class="my-1">
              <span class="mr-2 text-black font-bold font-headings text-2xl" data-testid="price">
                {{ $currency(getRegularPrice) }}
              </span>
            </div>
            <div class="inline-flex items-center mt-4 mb-2">
              <SfRating size="xs" :value="4" :max="5" />
              <SfCounter class="ml-1" size="xs">
                26
              </SfCounter>
              <SfLink href="#" variant="secondary" class="ml-2 text-xs text-neutral-500">
                26 reviews
              </SfLink>
            </div>

            <div class="py-4 mb-4 border-gray-200 border-y">
              <div v-show="productsInCart"
                class="w-full mb-4 bg-primary-200 p-2 rounded-md text-center text-primary-700">
                <SfIconShoppingCartCheckout />
                {{ productsInCart }} products in cart
              </div>

              <div class="flex flex-col md:flex-row flex-wrap gap-4">
                <UiQuantitySelector v-model="quantitySelectorValue" :value="quantitySelectorValue"
                  class="min-w-[145px] flex-grow flex-shrink-0 basis-0" />
                <SfButton :disabled="loadingProductTemplate" type="button" size="lg"
                  class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap" @click="handleCartAdd">
                  <template #prefix>
                    <SfIconShoppingCart size="sm" />
                  </template>
                  {{ $t("addToCart") }}
                </SfButton>
              </div>

              <div class="lg:px-4 mt-6" data-testid="product-properties">
                <fieldset v-if="colorOptions.length" class="pb-2 flex">
                  <span v-for="color in colorOptions" :key="color.id" class="mr-2 mb-2 uppercase">
                    <SfChip class="min-w-[48px]" size="sm" :model-value="color.id === selectedColor"
                      @update:model-value="
                        $event && color.id !== selectedColor
                          ? updateFilter({ Color: color.id.toString() })
                          : null
                        ">
                      {{ color.label }}
                    </SfChip>
                  </span>
                </fieldset>
              </div>


              <div class="flex justify-center mt-4 gap-x-4">
                <SfButton type="button" size="sm" variant="tertiary" v-if="productVariant" @click="
                  isInWishlist(productVariant.id as number)
                    ? handleWishlistRemoveItem()
                    : handleWishlistAddItem()
                  ">

                  <SfIconFavoriteFilled v-show="isInWishlist(productVariant.id as number)" size="sm" />

                  <SfIconFavorite v-show="!isInWishlist(productVariant.id as number)" size="sm" />
                  {{
                    isInWishlist(productVariant.id as number)
                      ? $t('wishlist.removeFromWishlist')
                      : $t('wishlist.addToWishlist')
                  }}
                </SfButton>
              </div>
            </div>
            <div class="flex first:mt-4">
              <SfIconPackage size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
              <p class="text-sm">
                <i18n-t keypath="additionalInfo.shipping" scope="global">
                  <template #date>
                    {{ tomorrow }}
                  </template>
                  <template #addAddress>
                    <SfLink class="ml-1" href="#" variant="secondary">
                      {{ $t("additionalInfo.addAddress") }}
                    </SfLink>
                  </template>
                </i18n-t>
              </p>
            </div>
            <div class="flex mt-4">
              <SfIconWarehouse size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
              <p class="text-sm">
                <i18n-t keypath="additionalInfo.pickup" scope="global">
                  <template #checkAvailability>
                    <SfLink class="ml-1" href="#" variant="secondary">
                      {{ $t("additionalInfo.checkAvailability") }}
                    </SfLink>
                  </template>
                </i18n-t>
              </p>
            </div>
            <div class="flex mt-4">
              <SfIconSafetyCheck size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
              <i18n-t keypath="additionalInfo.returns" scope="global">
                <template #details>
                  <SfLink class="ml-1" href="#" variant="secondary">
                    {{ $t("additionalInfo.details") }}
                  </SfLink>
                </template>
              </i18n-t>
            </div>
          </div>
        </section>
        <section class="grid-in-left-bottom md:mt-8">
          <UiDivider class="mt-10 mb-6" />

          <UiDivider class="my-4 md:mt-6" />
          <div>
            <h2 class="font-bold font-headings text-lg leading-6 md:text-2xl">
              {{ $t("productDetails") }}
            </h2>
            <p>
              {{ productTemplate?.description }}
            </p>

            <UiDivider class="my-4" />

            <h2 class="font-bold font-headings text-lg leading-6 md:text-2xl">
              {{ $t("customerReviews") }}
            </h2>
            <p>
              Lightweight • Non slip • Flexible outsole • Easy to wear on and
              off
            </p>
          </div>
        </section>
        <UiDivider class="mt-4 mb-2" />
      </div>
      <section v-if="!loadingProductTemplate && productTemplate?.frequentlyBoughtTogether" class="lg:mx-4 mt-28">
        <LazyProductSlider text="Recommended with this product"
          :product-template-list="productTemplate?.frequentlyBoughtTogether" />
      </section>
      <section v-if="!loadingProductTemplate && productTemplate?.alternativeProducts" class="lg:mx-4 mb-20">
        <LazyProductSlider text="Alternative product" :product-template-list="productTemplate?.alternativeProducts" />
      </section>
      <section v-if="!loadingProductTemplate" class="lg:mx-4 mb-20">
        <ClientOnly>
          <LazyProductRecentViewSlider text="Your recent views" />
        </ClientOnly>
      </section>
    </div>
    <template #error="{ error }">
      <div>
        <p class="mt-8 font-.medium">
          {{ $t("emptyStateText") }}
        </p>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>