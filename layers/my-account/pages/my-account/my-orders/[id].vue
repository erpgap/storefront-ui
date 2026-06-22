<script setup lang="ts">
import { SfLoaderCircular } from '@storefront-ui/vue'
import { formatDate } from '~~/app/utils/date'

definePageMeta({
  layout: 'account',
  middleware: ['auth-check'],
})

const route = useRoute()
const { getOrderById, order } = useOrders()
const NuxtLink = resolveComponent('NuxtLink')

const loaded = ref(false)
onMounted(async () => {
  // nextTick: route params aren't settled on first client navigation without it.
  await nextTick()
  try {
    await getOrderById({ id: parseInt(route.params.id as string) })
  }
  finally {
    // Always stop the spinner, even if the fetch fails.
    loaded.value = true
  }
})

const lines = computed(() =>
  (order.value?.reportOrderLine ?? []).filter((item: any) => item?.product != null),
)
const totalItems = computed(() =>
  lines.value.reduce((n: number, l: any) => n + (Number(l?.quantity) || 0), 0),
)
// Publish the order reference so the account layout can show it in the breadcrumb.
const orderCrumb = useState<string>('account-order-crumb', () => '')
watch(() => order.value?.name, (n) => { orderCrumb.value = n ? `#${n}` : '' }, { immediate: true })
onUnmounted(() => { orderCrumb.value = '' })
</script>

<template>
  <div class="col-span-3">
    <NuxtLink
      to="/my-account/my-orders"
      class="inline-flex items-center gap-1.5 text-[13px] text-primary-500 hover:text-black transition-colors mb-6"
    >
      <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M17 7H2M7 1 2 7l5 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Back to orders
    </NuxtLink>

    <div v-if="!loaded" class="flex justify-center py-24">
      <SfLoaderCircular size="xl" />
    </div>

    <template v-else-if="order?.id">
      <h2 class="font-bold typography-headline-4 mb-6">
        #{{ order.name }}
      </h2>

      <!-- Meta strip -->
      <div class="grid grid-cols-3 border border-primary-100 rounded-[3px] divide-x divide-primary-100 mb-10">
        <div class="p-4">
          <p class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-1.5">Date</p>
          <p class="text-[14px]">{{ formatDate(order.dateOrder) }}</p>
        </div>
        <div class="p-4">
          <p class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-1.5">Items</p>
          <p class="text-[14px]">{{ totalItems }}</p>
        </div>
        <div class="p-4">
          <p class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-1.5">Total</p>
          <p class="text-[14px] font-medium">{{ $currency(Number(order.amountTotal) || 0) }}</p>
        </div>
      </div>

      <!-- Items -->
      <h3 class="text-[12px] tracking-[0.16em] uppercase font-medium text-primary-400 mb-1">
        Items
      </h3>
      <ul class="border-t border-primary-100 divide-y divide-primary-100">
        <li
          v-for="(line, i) in lines"
          :key="i"
          class="flex items-center gap-4 py-5"
        >
          <span class="shrink-0 w-[72px] h-[72px] rounded-[2px] bg-primary-50 overflow-hidden">
            <NuxtImg
              provider="odooProvider"
              :src="line.product?.imageUrl ?? ''"
              :alt="line.product?.name ?? ''"
              width="72"
              height="72"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </span>
          <div class="flex-1 min-w-0">
            <p class="font-medium leading-snug">{{ line.product?.name }}</p>
            <ul
              v-if="line.product?.variantAttributeValues?.length"
              class="mt-2 text-[12px] tracking-[0.14em] uppercase font-medium space-y-1"
            >
              <li
                v-for="attribute in line.product?.variantAttributeValues"
                :key="attribute.id"
                class="text-primary-400"
              >
                {{ attribute.attribute?.name }}<span class="text-black"> — {{ attribute.name }}</span>
              </li>
            </ul>
            <p class="mt-1 text-[13px] text-primary-500">
              Qty {{ line.quantity }} <span class="text-primary-300">·</span> {{ $currency(Number(line.priceUnit) || 0) }}
            </p>
          </div>
          <span class="font-medium whitespace-nowrap">{{ $currency(Number(line.priceSubtotal) || 0) }}</span>
        </li>
      </ul>

      <!-- Summary -->
      <div class="mt-10 w-full sm:max-w-[360px] sm:ml-auto border border-primary-100 rounded-[2px]">
        <div class="px-5 md:px-6 py-6 text-[14px]">
          <div class="flex justify-between py-1.5">
            <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">Subtotal</span>
            <span>{{ $currency(Number(order.amountSubtotal) || 0) }}</span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">Delivery</span>
            <span>{{ $currency(Number(order.amountDelivery) || 0) }}</span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">Tax</span>
            <span>{{ $currency(Number(order.amountTax) || 0) }}</span>
          </div>
          <div class="flex justify-between items-baseline mt-4 pt-4 border-t border-primary-100">
            <span class="text-[16px] font-medium uppercase tracking-[0.08em]">Total</span>
            <span class="text-[18px] font-medium">{{ $currency(Number(order.amountTotal) || 0) }}</span>
          </div>
        </div>
      </div>
    </template>

    <p v-else class="py-16 text-center text-primary-500 font-light">
      We couldn't load this order.
    </p>
  </div>
</template>
