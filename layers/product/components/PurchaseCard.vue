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
  SfRating,
} from '@storefront-ui/vue'

type ColorOption = { id: number; label: string }

const props = defineProps<{
  productName?: string
  hasDiscount?: boolean
  regularPriceText?: number
  specialPriceText?: number

  productsInCart: number
  quantity: number
  loading: boolean

  colorOptions: ColorOption[]
  selectedColor: number | null

  inWishlist: boolean
  tomorrowText: string
}>()

const emit = defineEmits<{
  (e: 'update:quantity', value: number): void
  (e: 'add-to-cart'): void
  (e: 'select-color', colorId: number): void
  (e: 'toggle-wishlist'): void
}>()
</script>

<template>
  <div class="p-6 xl:p-6 md:border md:border-neutral-100 md:shadow-lg md:rounded-md md:sticky md:top-20 min-h-[300px]"
    data-testid="purchase-card">
    <h1 class="mb-1 font-bold typography-headline-4" data-testid="product-name">
      {{ productName }}
    </h1>

    <div>
      <template v-if="hasDiscount">
        <div
          class="inline-flex items-center justify-center font-medium rounded-none bg-secondary-800 text-sm p-1.5 gap-1 mb-4">
          <SfIconSell color="white" size="sm" class="mr-1" />
          <span class="mr-1 text-white">sale</span>
        </div>

        <span class="mr-2 text-black font-bold font-headings text-2xl" data-testid="price">
          {{ $currency(specialPriceText) }}
        </span>
        <span class="text-base font-normal text-neutral-500 line-through">
          {{ $currency(regularPriceText) }}
        </span>
      </template>

      <template v-else>
        <span class="mr-2 text-black font-bold font-headings text-2xl" data-testid="price">
          {{ $currency(regularPriceText) }}
        </span>
      </template>
    </div>

    <div class="inline-flex items-center mt-4 mb-2">
      <SfRating size="xs" :value="4" :max="5" />
      <SfCounter class="ml-1" size="xs">26</SfCounter>
      <SfLink href="#" variant="secondary" class="ml-2 text-xs text-neutral-500">26 reviews</SfLink>
    </div>

    <div class="py-4 mb-4 border-gray-200 border-y">
      <div v-show="productsInCart" class="w-full mb-4 bg-primary-200 p-2 rounded-md text-center text-primary-700">
        <SfIconShoppingCartCheckout />
        {{ productsInCart }} products in cart
      </div>

      <div class="flex flex-col md:flex-row flex-wrap gap-4">
        <UiQuantitySelector :model-value="quantity" class="min-w-[145px] flex-grow flex-shrink-0 basis-0"
          @update:model-value="emit('update:quantity', $event)" />

        <SfButton :disabled="loading" type="button" size="lg"
          class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap" @click="emit('add-to-cart')">
          <template #prefix>
            <SfIconShoppingCart size="sm" />
          </template>
          Add to cart
        </SfButton>
      </div>

      <div class="lg:px-4 mt-6" data-testid="product-properties">
        <fieldset v-if="colorOptions?.length" class="pb-2 flex">
          <span v-for="c in colorOptions" :key="c.id" class="mr-2 mb-2 uppercase">
            <SfChip class="min-w-[48px]" size="sm" :model-value="c.id === selectedColor"
              @update:model-value="$event && emit('select-color', c.id)">
              {{ c.label }}
            </SfChip>
          </span>
        </fieldset>
      </div>

      <div class="flex justify-center mt-4 gap-x-4">
        <SfButton type="button" size="sm" variant="tertiary" @click="emit('toggle-wishlist')">
          <SfIconFavoriteFilled v-show="inWishlist" size="sm" />
          <SfIconFavorite v-show="!inWishlist" size="sm" />
          {{ inWishlist ? 'Remove from wishlist' : 'Add to wishlist' }}
        </SfButton>
      </div>
    </div>

    <div class="flex first:mt-4">
      <SfIconPackage size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
      <p class="text-sm">
        <i18n-t keypath="additionalInfo.shipping" scope="global">
          <template #date>
            {{ tomorrowText }}
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
</template>
