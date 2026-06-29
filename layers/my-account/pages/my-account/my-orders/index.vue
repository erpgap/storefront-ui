<script setup lang="ts">
import { SfButton, SfLoaderCircular } from '@storefront-ui/vue'

import { type Order } from '~~/graphql'
import { formatDate } from '~~/app/utils/date'

definePageMeta({
  layout: 'account',
  middleware: ['auth-check'],
})

const { getOrders, orders } = useOrders()

// Gate the table/empty decision on the first fetch so neither flashes (and an
// empty table header never shows before data arrives).
const loaded = ref(false)
onMounted(async () => {
  await getOrders()
  loaded.value = true
})

const orderLines = (order: Order): any[] => order?.websiteOrderLine ?? []
const orderThumbs = (order: Order) =>
  orderLines(order).map(l => l?.product?.imageUrl).filter(Boolean).slice(0, 4)
const orderExtra = (order: Order) => Math.max(0, orderLines(order).length - 4)
const itemCount = (order: Order) =>
  orderLines(order).reduce((n, l) => n + (Number(l?.quantity) || 0), 0)

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div v-if="loaded && orders?.orders?.length" class="col-span-3">
    <ul class="border-t border-primary-100 divide-y divide-primary-100">
      <li
        v-for="order in orders.orders"
        :key="order?.id"
      >
        <NuxtLink
          :to="`/my-account/my-orders/${order?.id}`"
          class="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 py-5 px-2 -mx-2 rounded-md hover:bg-primary-50 transition-colors"
        >
          <!-- Order info (fixed width on desktop so thumbnails always align) -->
          <div class="min-w-0 sm:w-[240px] sm:shrink-0">
            <span class="block font-medium">#{{ order?.name }}</span>
            <span class="block mt-1 text-[13px] text-primary-500 font-light">
              {{ formatDate(order?.dateOrder) }}
              <span class="text-primary-300">·</span>
              {{ itemCount(order as Order) }} {{ itemCount(order as Order) === 1 ? 'item' : 'items' }}
            </span>
          </div>

          <!-- Product thumbnails -->
          <div
            v-if="orderThumbs(order as Order).length"
            class="flex gap-2 shrink-0"
          >
            <span
              v-for="(src, i) in orderThumbs(order as Order)"
              :key="i"
              class="w-14 h-14 rounded-[2px] bg-primary-50 overflow-hidden"
            >
              <NuxtImg
                provider="odooProvider"
                :src="src"
                :alt="order?.name ?? ''"
                width="56"
                height="56"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </span>
            <span
              v-if="orderExtra(order as Order) > 0"
              class="w-14 h-14 rounded-[2px] bg-primary-50 grid place-items-center text-[12px] text-primary-500"
            >+{{ orderExtra(order as Order) }}</span>
          </div>

          <!-- Total + view -->
          <div class="flex items-center justify-between sm:justify-end gap-5 sm:ml-auto sm:shrink-0">
            <span class="font-medium">{{ $currency(order?.amountTotal || 0) }}</span>
            <span class="inline-flex items-center gap-1.5 text-[13px] text-primary-500 group-hover:text-black transition-colors whitespace-nowrap">
              {{ $t("account.myOrders.details") }}
              <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>

  <div v-else-if="!loaded" class="col-span-3 flex justify-center py-24">
    <SfLoaderCircular size="xl" />
  </div>

  <div
    v-else
    class="col-span-3 flex flex-col items-center text-center py-12 md:py-16"
  >
    <NuxtImg
      src="/img/content/empty-cart.webp"
      alt=""
      aria-hidden="true"
      class="w-[170px] h-[170px] md:w-[200px] md:h-[200px] object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.14)]"
      loading="lazy"
    />
    <h3 class="mt-7 font-light tracking-[-0.01em] text-[clamp(22px,2.4vw,28px)]">
      {{ $t("account.myOrders.noOrders") }}
    </h3>
    <p class="mt-3 text-primary-500 font-light max-w-[380px]">
      Once you place an order, it'll show up here so you can track and revisit it.
    </p>
    <SfButton
      :tag="NuxtLink"
      to="/products"
      class="mt-8 min-h-[52px] px-8 text-[13px] font-medium"
    >
      {{ $t("account.myOrders.continue") }}
    </SfButton>
  </div>
</template>
