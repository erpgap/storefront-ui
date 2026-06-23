<script setup lang="ts">
import { SfLoaderCircular } from '@storefront-ui/vue'
import type { Order } from '~~/graphql'
import { formatDate } from '~~/app/utils/date'

definePageMeta({
  layout: 'account',
  middleware: ['auth-check'],
})

const { user } = useAuth()
const { getOrders, orders, loading } = useOrders()
const NuxtLink = resolveComponent('NuxtLink')

const firstName = computed(() =>
  String((user.value as any)?.name ?? '').trim().split(' ')[0] || '',
)
const email = computed(() => String((user.value as any)?.email ?? ''))

// Most recent order (highest id) — the orders query order isn't guaranteed.
const latestOrder = computed<Order | null>(() => {
  const list = orders.value?.orders ?? []
  if (!list.length) return null
  return [...list].sort((a, b) => Number(b?.id) - Number(a?.id))[0] ?? null
})
const lines = computed<any[]>(() => latestOrder.value?.websiteOrderLine ?? [])
const itemCount = computed(() =>
  lines.value.reduce((n, l) => n + (Number(l?.quantity) || 0), 0),
)
const thumbs = computed(() =>
  lines.value.map(l => l?.product?.imageUrl).filter(Boolean).slice(0, 4),
)


// Don't decide card-vs-empty until the first fetch resolves, so the empty
// state never flashes before orders load.
const loaded = ref(false)
onMounted(async () => {
  await getOrders()
  loaded.value = true
})
</script>

<template>
  <div class="w-full max-w-[640px]">
    <p class="text-primary-500 font-light">
      Welcome back<template v-if="firstName">, {{ firstName }}</template>.
    </p>
    <p v-if="email" class="mt-1 text-[13px] text-primary-400">
      Signed in as <span class="text-primary-700">{{ email }}</span>
    </p>

    <!-- Latest order -->
    <div class="mt-8">
      <div class="flex items-baseline justify-between mb-3">
        <h2 class="text-[12px] tracking-[0.16em] uppercase font-medium text-primary-400">
          Latest order
        </h2>
        <NuxtLink
          to="/my-account/my-orders"
          class="text-[13px] underline underline-offset-4 decoration-primary-300 hover:decoration-black transition-colors"
        >
          View all orders
        </NuxtLink>
      </div>

      <div v-if="!loaded" class="flex justify-center py-10">
        <SfLoaderCircular size="lg" />
      </div>

      <NuxtLink
        v-else-if="latestOrder"
        :to="`/my-account/my-orders/${latestOrder.id}`"
        class="group block border border-primary-100 rounded-[3px] p-5 transition-colors hover:border-black"
      >
        <span class="block text-[15px] font-medium">#{{ latestOrder.name }}</span>

        <div v-if="thumbs.length" class="flex gap-2 mt-4">
          <span
            v-for="(src, i) in thumbs"
            :key="i"
            class="w-14 h-14 rounded-[2px] bg-primary-50 overflow-hidden shrink-0"
          >
            <NuxtImg
              provider="odooProvider"
              :src="src"
              :alt="latestOrder.name ?? ''"
              width="56"
              height="56"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </span>
          <span
            v-if="lines.length > thumbs.length"
            class="w-14 h-14 rounded-[2px] bg-primary-50 grid place-items-center text-[12px] text-primary-500 shrink-0"
          >+{{ lines.length - thumbs.length }}</span>
        </div>

        <div class="flex items-center justify-between gap-3 mt-4">
          <span class="text-[13px] text-primary-500 font-light">
            {{ formatDate(latestOrder.dateOrder) }}
            <span class="text-primary-300">·</span> {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
            <span class="text-primary-300">·</span> <span class="text-primary-700 font-medium">{{ $currency(latestOrder.amountTotal || 0) }}</span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-[13px] text-primary-500 group-hover:text-black transition-colors whitespace-nowrap">
            View order
            <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </NuxtLink>

      <div v-else class="border border-primary-100 rounded-[3px] p-6 text-center">
        <p class="text-primary-500 font-light mb-4">
          You haven't placed any orders yet.
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 text-[13px] tracking-[0.1em] uppercase font-medium border-b border-black pb-1 hover:text-primary-600 transition-colors"
        >
          Start shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
