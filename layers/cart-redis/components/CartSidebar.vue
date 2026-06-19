<script setup lang="ts">
import {
  SfDrawer,
  SfButton,
  SfIconClose,
  useTrapFocus,
} from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const { cart, removeItemFromCart, updateItemQuantity, totalItemsInCart } = useCart()
const { cartSidebarIsOpen, closeCartSideBar } = useCartUiState()

const drawerRef = ref()
useTrapFocus(drawerRef, { activeState: cartSidebarIsOpen })

const lines = computed(() => cart.value?.order?.websiteOrderLine ?? [])

const goTo = (to: string) => {
  closeCartSideBar()
  navigateTo(to)
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="cartSidebarIsOpen"
      class="fixed inset-0 !w-screen !h-screen bg-neutral-500 bg-opacity-50 transition-opacity duration-500 top-index"
      @click="closeCartSideBar()"
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
        v-model="cartSidebarIsOpen"
        :disable-esc="false"
        placement="right"
        class="shadow-none z-[100] w-full sm:w-[420px] bg-white flex flex-col"
        data-testid="cart-sidebar"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 h-[64px] border-b border-primary-100 shrink-0">
          <span class="text-[13px] tracking-[0.16em] uppercase font-medium text-black">
            Cart <span class="text-primary-400">({{ totalItemsInCart }})</span>
          </span>
          <SfButton variant="tertiary" square aria-label="Close cart" class="!text-black" @click="closeCartSideBar()">
            <SfIconClose />
          </SfButton>
        </div>

        <!-- Items -->
        <div v-if="lines.length" class="flex-1 overflow-y-auto px-5 divide-y divide-primary-100">
          <div v-for="line in lines" :key="line?.id" class="flex gap-4 py-5">
            <NuxtLink
              :to="mountUrlSlugForProductVariant(line?.product as Product) || ''"
              class="shrink-0 w-[72px] h-[88px] overflow-hidden rounded-[2px] bg-primary-50"
              @click="closeCartSideBar()"
            >
              <NuxtImg
                provider="odooProvider"
                :src="line?.product?.imageUrl ?? ''"
                :alt="line?.product?.name ?? ''"
                width="144"
                height="176"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </NuxtLink>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <NuxtLink
                  :to="mountUrlSlugForProductVariant(line?.product as Product) || ''"
                  class="text-[14px] font-medium leading-snug pr-2 line-clamp-2"
                  @click="closeCartSideBar()"
                >
                  {{ line?.product?.name || line?.name }}
                </NuxtLink>
                <button
                  type="button"
                  aria-label="Remove item"
                  class="shrink-0 text-primary-400 hover:text-black transition-colors"
                  @click="removeItemFromCart(line!.id)"
                >
                  <SfIconClose size="sm" />
                </button>
              </div>
              <p class="mt-1.5 flex items-baseline gap-2">
                <span class="text-[16px] font-medium text-black">{{ $currency(line?.priceSubtotal || 0) }}</span>
                <span
                  v-if="line?.product?.combinationInfoVariant?.has_discounted_price"
                  class="text-[14px] text-primary-300 line-through"
                >
                  {{ $currency((line?.product?.combinationInfoVariant?.list_price || 0) * (line?.quantity || 1)) }}
                </span>
              </p>
              <div class="mt-3">
                <UiQuantitySelector
                  :model-value="Number(line?.quantity)"
                  :max-qty="Number(line?.product?.stock) || 10"
                  @update:model-value="updateItemQuantity(line!.id, Number($event))"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
          <NuxtImg src="/img/content/empty-cart.png" alt="" aria-hidden="true" class="w-[150px] h-[150px] object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.14)]" />
          <p class="font-light text-[20px] tracking-[-0.01em]">Your cart is empty</p>
          <SfButton class="min-h-[48px] px-7 text-[13px] font-medium" @click="goTo('/products')">
            Browse products
          </SfButton>
        </div>

        <!-- Footer -->
        <div v-if="lines.length" class="border-t border-primary-100 p-5 shrink-0 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">Subtotal</span>
            <span class="text-[16px] font-medium">{{ $currency(cart?.order?.amountTotal || 0) }}</span>
          </div>
          <p class="text-[12px] text-primary-400">Shipping &amp; taxes calculated at checkout.</p>
          <div class="flex flex-col gap-2.5">
            <SfButton class="w-full min-h-[52px] text-[13px] font-medium" @click="goTo('/checkout')">
              Checkout
            </SfButton>
            <SfButton
              variant="tertiary"
              class="w-full min-h-[48px] text-[13px] tracking-[0.1em] uppercase font-medium !border !border-primary-200 !text-black hover:!bg-transparent hover:!border-black"
              @click="goTo('/cart')"
            >
              View cart
            </SfButton>
          </div>
        </div>
      </SfDrawer>
    </transition>
  </div>
</template>
