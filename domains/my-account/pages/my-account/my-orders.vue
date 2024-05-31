<script setup lang="ts">
import { SfButton, SfLoaderCircular } from "@storefront-ui/vue";
import { useOrders } from "~/domains/orders/composable/useOrders";
import {
  PaymentTransactionState,
  type Order,
  type PaymentTransaction,
} from "~/graphql";

definePageMeta({
  layout: "account",
  middleware: ["auth-check"],
});

const { getOrders, orders, loading } = useOrders();

onMounted(async () => {
  await getOrders();
});

const isTransactionCancelled = (
  transaction?: PaymentTransaction | null
): boolean => {
  return transaction?.state === PaymentTransactionState.Canceled;
};

const getLastOrderTransaction = (order: Order): PaymentTransaction | null => {
  return order.transactions?.[order.transactions.length - 1] ?? null;
};

const NuxtLink = resolveComponent("NuxtLink");
</script>

<template>
  <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />
  <h2 class="hidden md:block typography-headline-4 font-bold mx-4 capitalize">
    {{ $t("account.ordersAndReturns.myOrders") }}
  </h2>

  <div v-if="orders?.orders" class="col-span-3">
    <table class="hidden md:block text-left typography-text-sm mx-4">
      <caption class="hidden">
        List of orders
      </caption>
      <thead class="border-b-2 border-neutral-200">
        <tr>
          <th class="py-4 pr-4 font-medium">
            {{ $t("account.ordersAndReturns.orderId") }}
          </th>
          <th class="py-4 px-4 font-medium lg:whitespace-nowrap">
            {{ $t("account.ordersAndReturns.orderDate") }}
          </th>
          <th class="py-4 px-4 font-medium">
            {{ $t("account.ordersAndReturns.amount") }}
          </th>
          <th class="py-4 px-4 font-medium">
            {{ $t("account.ordersAndReturns.status") }}
          </th>
          <th class="py-4 pl-4"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders.orders"
          :key="order?.id"
          class="border-b border-neutral-200"
        >
          <td class="py-4 pr-4 lg:whitespace-nowrap">{{ order?.name }}</td>
          <td class="p-4 lg:whitespace-nowrap">{{ order?.dateOrder }}</td>
          <td class="p-4">
            {{ $currency(order?.amountTotal ? order?.amountTotal : 0) }}
          </td>
          <td
            v-if="order"
            :class="[
              'p-4',
              {
                'text-negative-700': isTransactionCancelled(
                  getLastOrderTransaction(order)
                ),
              },
              ,
            ]"
          >
            {{ getLastOrderTransaction(order)?.state ?? "--" }}
          </td>
          <td class="py-1.5 pl-4 text-right w-full">
            <SfButton
              :tag="NuxtLink"
              size="sm"
              variant="tertiary"
              :to="`/my-account/my-orders/${order?.id}`"
            >
              {{ $t("account.ordersAndReturns.details") }}
            </SfButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="w-full text-center">
    <SfLoaderCircular size="xl" class="mt-[160px]" />
  </div>
  <div v-if="orders?.orders?.length === 0" class="col-span-3 text-center mt-8">
    <NuxtImg
      src="/images/empty-cart.svg"
      :alt="$t('account.ordersAndReturns.noOrdersAltText')"
      width="192"
      height="192"
      class="mx-auto"
      loading="lazy"
    />
    <h3 class="typography-headline-3 font-bold mb-4 mt-6">
      {{ $t("account.ordersAndReturns.noOrders") }}
    </h3>
    <SfButton variant="secondary" class="!ring-neutral-200">
      {{ $t("account.ordersAndReturns.continue") }}</SfButton
    >
  </div>
  <NuxtPage />
</template>
