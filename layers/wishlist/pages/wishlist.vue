<script setup lang="ts">
import { SfButton, SfIconArrowBack, SfLoaderCircular } from '@storefront-ui/vue'
import type { Product } from '~~/graphql'
import { useProductAttributes } from '~~/layers/product/composables/useProductAttributes'

const NuxtLink = resolveComponent('NuxtLink')

const { wishlist, loadWishlist, loading } = useWishlist()
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

useHead({ title: 'Wishlist — Alokai' })

const ready = ref(false)
onMounted(async () => {
  await loadWishlist()
  ready.value = true
})

const items = computed(() => wishlist.value?.wishlistItems ?? [])
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
      class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
      data-testid="wishlist-grid"
    >
      <LazyUiProductCard
        v-for="item in items"
        :key="item?.id"
        :name="item?.product?.name ?? ''"
        :slug="mountUrlSlugForProductVariant(item?.product as Product) || ''"
        :image-url="(item?.product as any)?.imageUrl ?? ''"
        :image-alt="item?.product?.name ?? ''"
        :regular-price="getRegularPrice(item?.product as Product)"
        :special-price="getSpecialPrice(item?.product as Product)"
        :rating-count="(item?.product as any)?.ratingCount ?? 0"
        :rating="(item?.product as any)?.ratingAvg ?? 0"
        :first-variant="item?.product as Product"
      />
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
            src="/img/content/empty-wishlist.webp"
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
