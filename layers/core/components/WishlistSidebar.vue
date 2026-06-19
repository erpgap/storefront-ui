<script setup lang="ts">
import {
  SfDrawer,
  SfButton,
  SfIconClose,
  SfLoaderCircular,
  useTrapFocus,
} from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const { wishlist, wishlistRemoveItem, wishlistTotalItems, loading } = useWishlist()
const { wishlistSidebarIsOpen, closeWishlistSideBar } = useWishlistUiState()

const drawerRef = ref()
useTrapFocus(drawerRef, { activeState: wishlistSidebarIsOpen })

const items = computed(() => wishlist.value?.wishlistItems ?? [])

const goTo = (to: string) => {
  closeWishlistSideBar()
  navigateTo(to)
}

const price = (p: any) => Number(p?.combinationInfoVariant?.price ?? p?.price ?? 0)
const listPrice = (p: any) => Number(p?.combinationInfoVariant?.list_price ?? 0)
const hasDiscount = (p: any) => p?.combinationInfoVariant?.has_discounted_price && listPrice(p) > price(p)
</script>

<template>
  <div class="w-full">
    <div
      v-if="wishlistSidebarIsOpen"
      class="fixed inset-0 !w-screen !h-screen bg-neutral-500 bg-opacity-50 transition-opacity duration-500 top-index"
      @click="closeWishlistSideBar()"
    />
    <transition
      enter-active-class="transition duration-500 ease-in-out"
      leave-active-class="transition duration-500 ease-in-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <SfDrawer
        ref="drawerRef"
        v-model="wishlistSidebarIsOpen"
        placement="right"
        class="shadow-none z-[100] w-full sm:w-[420px] bg-white flex flex-col"
        data-testid="wishlist-sidebar"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 h-[64px] border-b border-primary-100 shrink-0">
          <span class="text-[13px] tracking-[0.16em] uppercase font-medium text-black">
            Wishlist <span class="text-primary-400">({{ wishlistTotalItems }})</span>
          </span>
          <SfButton variant="tertiary" square aria-label="Close wishlist" class="!text-black" @click="closeWishlistSideBar()">
            <SfIconClose />
          </SfButton>
        </div>

        <div v-if="loading" class="flex-1 grid place-items-center">
          <SfLoaderCircular size="lg" />
        </div>

        <!-- Items -->
        <div v-else-if="items.length" class="flex-1 overflow-y-auto px-5 divide-y divide-primary-100">
          <div v-for="item in items" :key="item?.id" class="flex gap-4 py-5">
            <NuxtLink
              :to="mountUrlSlugForProductVariant(item?.product as Product) || ''"
              class="shrink-0 w-[72px] h-[88px] overflow-hidden rounded-[2px] bg-primary-50"
              @click="closeWishlistSideBar()"
            >
              <NuxtImg
                provider="odooProvider"
                :src="(item?.product as any)?.imageUrl ?? ''"
                :alt="item?.product?.name ?? ''"
                width="144"
                height="176"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </NuxtLink>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <NuxtLink
                  :to="mountUrlSlugForProductVariant(item?.product as Product) || ''"
                  class="text-[14px] font-medium leading-snug pr-2 line-clamp-2"
                  @click="closeWishlistSideBar()"
                >
                  {{ item?.product?.name }}
                </NuxtLink>
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  class="shrink-0 text-primary-400 hover:text-black transition-colors"
                  @click="wishlistRemoveItem((item?.product as any)?.id)"
                >
                  <SfIconClose size="sm" />
                </button>
              </div>
              <p class="mt-1.5 flex items-baseline gap-2">
                <span class="text-[16px] font-medium text-black">{{ $currency(price(item?.product)) }}</span>
                <span v-if="hasDiscount(item?.product)" class="text-[14px] text-primary-300 line-through">
                  {{ $currency(listPrice(item?.product)) }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
          <NuxtImg src="/img/content/empty-wishlist.png" alt="" aria-hidden="true" class="w-[150px] h-[150px] object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.14)]" />
          <p class="font-light text-[20px] tracking-[-0.01em]">Your wishlist is empty</p>
          <SfButton class="min-h-[48px] px-7 text-[13px] font-medium" @click="goTo('/products')">
            Browse products
          </SfButton>
        </div>

        <!-- Footer -->
        <div v-if="items.length" class="border-t border-primary-100 p-5 shrink-0">
          <SfButton
            variant="tertiary"
            class="w-full min-h-[52px] text-[13px] tracking-[0.1em] uppercase font-medium !border !border-primary-200 !text-black hover:!bg-transparent hover:!border-black"
            @click="goTo('/wishlist')"
          >
            View wishlist
          </SfButton>
        </div>
      </SfDrawer>
    </transition>
  </div>
</template>
