<script setup lang="ts">
import { SfButton, SfIconArrowBack, SfIconClose, SfLoaderCircular } from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const { wishlist, wishlistTotalItems, wishlistRemoveItem, loadWishlist, loading } = useWishlist()
const { cartAdd } = useCart()

useHead({ title: 'Wishlist — Alokai' })

const ready = ref(false)
onMounted(async () => {
  await loadWishlist()
  ready.value = true
})

const items = computed(() => wishlist.value?.wishlistItems ?? [])

const price = (p: any) => Number(p?.combinationInfoVariant?.price ?? p?.price ?? 0)
const listPrice = (p: any) => Number(p?.combinationInfoVariant?.list_price ?? 0)
const hasDiscount = (p: any) => p?.combinationInfoVariant?.has_discounted_price && listPrice(p) > price(p)
</script>

<template>
  <div class="narrow-container pb-20">
    <div class="flex items-center justify-between mt-8 mb-10">
      <h1 class="font-bold typography-headline-3 md:typography-headline-2">
        Wishlist
      </h1>
      <SfButton :tag="NuxtLink" to="/products" variant="tertiary" class="hidden md:flex">
        <template #prefix>
          <SfIconArrowBack />
        </template>
        Back to shopping
      </SfButton>
    </div>

    <div v-if="!ready || loading" class="min-h-[40vh] grid place-items-center">
      <SfLoaderCircular size="xl" />
    </div>

    <!-- Items grid -->
    <div
      v-else-if="items.length"
      class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
      data-testid="wishlist-grid"
    >
      <article
        v-for="item in items"
        :key="item?.id"
        class="group relative flex flex-col"
      >
        <div class="relative overflow-hidden rounded-[2px] bg-primary-50">
          <NuxtLink :to="mountUrlSlugForProductVariant(item?.product as Product) || ''" prefetch>
            <NuxtImg
              provider="odooProvider"
              :src="(item?.product as any)?.imageUrl ?? ''"
              :alt="item?.product?.name ?? ''"
              :width="370"
              :height="494"
              class="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </NuxtLink>

          <button
            type="button"
            aria-label="Remove from wishlist"
            class="absolute top-2 right-2 z-[2] grid place-items-center w-11 h-11 rounded-full text-primary-600 transition-colors hover:text-black"
            @click="wishlistRemoveItem((item?.product as any)?.id)"
          >
            <span class="grid place-items-center w-[34px] h-[34px] rounded-full bg-white/90 shadow-sm">
              <SfIconClose size="sm" />
            </span>
          </button>

          <button
            type="button"
            class="absolute left-3.5 right-3.5 bottom-3.5 z-[2] h-[46px] !rounded-[2px] bg-primary-900 text-white text-[12px] tracking-[0.14em] uppercase font-medium transition-all duration-300 hover:bg-primary-700 lg:opacity-0 lg:translate-y-3 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
            @click="cartAdd((item?.product as any)?.id, 1)"
          >
            Add to Bag
          </button>
        </div>

        <div class="pt-4">
          <NuxtLink
            :to="mountUrlSlugForProductVariant(item?.product as Product) || ''"
            class="block text-[15px] font-medium leading-tight"
          >
            {{ item?.product?.name }}
          </NuxtLink>
          <p class="mt-1.5 text-[14px] text-primary-600">
            <span
              v-if="hasDiscount(item?.product)"
              class="text-primary-300 line-through mr-2"
            >{{ $currency(listPrice(item?.product)) }}</span>
            {{ $currency(price(item?.product)) }}
          </p>
        </div>
      </article>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="py-[clamp(40px,10vh,120px)]"
      data-testid="wishlist-empty"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16 max-w-[940px] mx-auto">
        <div class="order-1 md:order-2 flex justify-center">
          <NuxtImg
            src="/img/content/empty-wishlist.png"
            alt=""
            aria-hidden="true"
            class="w-[240px] h-[240px] lg:w-[300px] lg:h-[300px] object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.16)]"
            loading="lazy"
          />
        </div>
        <div class="order-2 md:order-1 text-center md:text-left">
          <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-4">
            Saved for later
          </p>
          <h2 class="font-light tracking-[-0.02em] text-[clamp(30px,3.6vw,48px)]">
            Your wishlist is empty
          </h2>
          <p class="mt-5 text-primary-500 font-light leading-relaxed max-w-[380px] mx-auto md:mx-0">
            Tap the heart on any product to save your favourites here for later.
          </p>
          <div class="mt-9 flex flex-wrap justify-center md:justify-start gap-3">
            <SfButton :tag="NuxtLink" to="/products" class="min-h-[52px] px-7 text-[13px] font-medium">
              Browse products
            </SfButton>
            <SfButton
              :tag="NuxtLink"
              to="/"
              variant="tertiary"
              class="min-h-[52px] px-7 text-[13px] tracking-[0.1em] uppercase font-medium !border !border-primary-200 !text-black hover:!bg-transparent hover:!border-black"
            >
              Back to home
            </SfButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
