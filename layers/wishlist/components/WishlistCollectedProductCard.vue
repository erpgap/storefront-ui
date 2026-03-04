<script setup lang="ts">
import { SfLink, SfButton, SfIconClose } from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')
const { toggleWishlistSideBar } = useWishlistUiState()

const emit = defineEmits<{
  (e: 'removeFromWishlist', id: number | string): void
}>()

const props = defineProps<{
  product: Product
}>()

/** Normaliza os preços vindos do GraphQL (snake/camel) */
const currentPrice = computed<number>(() => {
  const p = props.product as any
  return Number(
    p?.combinationInfoVariant?.price
    ?? p?.price
    ?? 0,
  )
})

const listPrice = computed<number | null>(() => {
  const p = props.product as any
  const lp
    = p?.combinationInfoVariant?.list_price
      ?? p?.listPrice
  return lp == null ? null : Number(lp)
})

/** Promoção apenas quando list_price > price */
const hasDiscount = computed<boolean>(() => {
  const lp = listPrice.value
  const cp = currentPrice.value
  return lp != null && lp > 0 && cp > 0 && lp > cp
})

/** Imagem / slug */
const imageSrc = computed<string>(() => {
  const p = props.product as any
  return p?.image ?? '/images/product.webp'
})
const imageAlt = computed<string>(() => String((props.product as any)?.imageFilename ?? ''))
</script>

<template>
  <div
    class="relative flex first:border-t border-b-[1px] border-neutral-200 hover:shadow-lg min-w-[320px] p-4 last:mb-0"
    data-testid="cart-product-card"
  >
    <div class="min-w-[114px] w-[114px] overflow-hidden rounded-md">
      <SfLink
        :to="mountUrlSlugForProductVariant(product)"
        :tag="NuxtLink"
      >
        <NuxtImg
          provider="odooProvider"
          class="border rounded-md border-neutral-200"
          :src="imageSrc"
          :alt="imageAlt"
          width="114"
          height="151"
          loading="lazy"
        />
      </SfLink>
    </div>

    <div class="flex flex-col pl-4 pr-5">
      <div class="flex flex-col min-w-[180px] flex-1">
        <SfLink
          :tag="NuxtLink"
          :to="mountUrlSlugForProductVariant(product)"
          variant="secondary"
          class="no-underline typography-text-sm sm:typography-text-lg"
          @click="toggleWishlistSideBar()"
        >
          {{ product?.name }}
        </SfLink>

        <!-- Preços -->
        <div class="mt-1 flex items-baseline gap-2">
          <!-- atual SEMPRE preto -->
          <span class="text-black font-bold typography-text-sm sm:typography-text-lg">
            {{ $currency(currentPrice) }}
          </span>

          <!-- antigo riscado SOMENTE quando tiver promoção -->
          <span
            v-if="hasDiscount"
            class="text-neutral-500 line-through typography-text-xs sm:typography-text-sm font-normal"
          >
            {{ $currency(listPrice ?? 0) }}
          </span>
        </div>
      </div>
    </div>

    <div>
      <SfButton
        class="!p-1 !rounded-full absolute top-2 right-1"
        type="button"
        variant="tertiary"
        size="sm"
        @click="$emit('removeFromWishlist', (product as any)?.id)"
      >
        <SfIconClose />
      </SfButton>
    </div>
  </div>
</template>
