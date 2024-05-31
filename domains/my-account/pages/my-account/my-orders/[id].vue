<script setup lang="ts">
import { SfButton, SfIconClose, useDisclosure } from "@storefront-ui/vue";
import { useOrders } from "~/domains/orders/composable/useOrders";

const route = useRoute();
const router = useRouter();
const { isOpen } = useDisclosure({ initialValue: true });
const { getOrderById, order } = useOrders();

onMounted(async () => {
  // without nextTick data on first click does not load data
  await nextTick();
  await getOrderById({ id: parseInt(route.params.id) });
});

watch(
  isOpen,
  (isOpen) => {
    if (!isOpen) router.push("/my-account/my-orders");
  },
  { immediate: true }
);

const NuxtLink = resolveComponent("NuxtLink");
</script>
<template>
  <UiOverlay visible>
    <UiModal
      v-model="isOpen"
      as="section"
      role="dialog"
      class="h-full w-full overflow-auto !p-4 md:!p-10 md:max-w-[770px] md:h-fit"
    >
      <header
        class="flex justify-between bg-white items-center typography-headline-4 md:typography-headline-3 font-bold"
      >
        <h3>{{ $t("account.ordersAndReturns.orderDetails.heading") }}</h3>
        <SfButton
          square
          variant="tertiary"
          :tag="NuxtLink"
          :to="`/my-account/my-orders`"
          class="md:absolute md:top-2 md:right-2"
        >
          <SfIconClose class="text-neutral-500" />
        </SfButton>
      </header>
      <main class="mt-4">
        <ul class="bg-neutral-100 p-4 rounded-md md:columns-2 mb-6">
          <li>
            <p class="font-medium">
              {{ $t("account.ordersAndReturns.orderDetails.orderId") }}
            </p>
            <span>{{ order?.id }}</span>
          </li>
          <li class="my-4 md:mb-0">
            <p class="font-medium">
              {{ $t("account.ordersAndReturns.orderDetails.orderDate") }}
            </p>
            <span>{{ order?.dateOrder }}</span>
          </li>
          <li>
            <p class="font-medium">
              {{ $t("account.ordersAndReturns.orderDetails.paymentAmount") }}
            </p>
            <span>${{ order?.amountTotal }}</span>
          </li>
          <li class="mt-4">
            <p class="font-medium">
              {{ $t("account.ordersAndReturns.orderDetails.status") }}
            </p>
            <span v-if="order">{{
              order.transactions ? order.transactions.length - 1 : "--"
            }}</span>
          </li>
        </ul>
        <table
          class="hidden md:table w-full text-left typography-text-sm mx-4 md:mx-0"
        >
          <caption class="hidden">
            {{
              $t("account.ordersAndReturns.orderDetails.tableCaption")
            }}
          </caption>
          <thead>
            <tr class="border-b-2 border-neutral-200">
              <th class="py-3 font-medium">
                {{ $t("account.ordersAndReturns.orderDetails.product") }}
              </th>
              <th class="py-3 px-4 font-medium lg:whitespace-nowrap">
                {{ $t("account.ordersAndReturns.orderDetails.price") }}
              </th>
              <th class="py-3 px-4 font-medium">
                {{ $t("account.ordersAndReturns.orderDetails.quantity") }}
              </th>
              <th class="py-3 px-4 font-medium">
                {{ $t("account.ordersAndReturns.orderDetails.subtotal") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(line, i) in order?.websiteOrderLine"
              :key="i"
              class="border-b border-neutral-200 align-top"
            >
              <td class="pb-4 pr-4 lg:whitespace-nowrap typography-text-base">
                <ProductCardHorizontal :product="line.product" />
              </td>

              <td class="p-4 lg:whitespace-nowrap typography-text-base">
                ${{ line.product?.combinationInfo.price || " --" }}
              </td>
              <td class="p-4 typography-text-base">
                {{ line.quantity || " --" }}
              </td>
              <td class="p-4 typography-text-base">
                ${{ line.priceSubtotal || " --" }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="flex justify-between pt-4 border-t border-neutral-200 md:border-0"
        >
          <p>{{ $t("account.ordersAndReturns.orderDetails.itemsSubtotal") }}</p>
          <span>${{ order?.amountSubtotal }}</span>
        </div>
        <div class="flex justify-between my-2">
          <p>{{ $t("account.ordersAndReturns.orderDetails.delivery") }}</p>
          <span>{{ order?.amountDelivery }}</span>
        </div>
        <div class="flex justify-between border-b pb-4 border-neutral-200">
          <p>{{ $t("account.ordersAndReturns.orderDetails.estimatedTax") }}</p>
          <span>${{ order?.amountTax }}</span>
        </div>
        <div class="flex justify-between pt-4 typography-text-lg font-medium">
          <p>{{ $t("account.ordersAndReturns.orderDetails.total") }}</p>
          <span>${{ order?.amountTotal }}</span>
        </div>
      </main>
    </UiModal>
  </UiOverlay>
  <NuxtPage />
</template>
