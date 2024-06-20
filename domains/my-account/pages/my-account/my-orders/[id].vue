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

const linesWithoutUndefinedProducts = computed(() => {
  return order.value?.reportOrderLine?.filter((item) => item.product !== null);
});

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
        <h3>{{ $t("account.myOrders.orderDetails.heading") }}</h3>
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
              {{ $t("account.myOrders.orderDetails.orderId") }}
            </p>
            <span>{{ order?.name }}</span>
          </li>
          <li class="my-4 md:mb-0">
            <p class="font-medium">
              {{ $t("account.myOrders.orderDetails.orderDate") }}
            </p>
            <span>{{ order?.dateOrder }}</span>
          </li>
          <li>
            <p class="font-medium">
              {{ $t("account.myOrders.orderDetails.paymentAmount") }}
            </p>
            <span>${{ order?.amountTotal }}</span>
          </li>
          <li class="mt-4">
            <p class="font-medium">
              {{ $t("account.myOrders.orderDetails.status") }}
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
              $t("account.myOrders.orderDetails.tableCaption")
            }}
          </caption>
          <thead>
            <tr class="border-b-2 border-neutral-200">
              <th class="py-3 font-medium">
                {{ $t("account.myOrders.orderDetails.product") }}
              </th>
              <th class="py-3 px-4 font-medium lg:whitespace-nowrap">
                {{ $t("account.myOrders.orderDetails.price") }}
              </th>
              <th class="py-3 px-4 font-medium">
                {{ $t("account.myOrders.orderDetails.quantity") }}
              </th>
              <th class="py-3 px-4 font-medium">
                {{ $t("account.myOrders.orderDetails.subtotal") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(line, i) in linesWithoutUndefinedProducts"
              :key="i"
              class="border-b border-neutral-200 align-top"
            >
              <td class="pb-4 pr-4 lg:whitespace-nowrap typography-text-base">
                <ProductCardHorizontal
                  v-if="line.product"
                  :product="line.product"
                />
              </td>

              <td class="p-4 lg:whitespace-nowrap typography-text-base">
                {{
                  $currency(Number(line.product?.combinationInfo.price)) || "--"
                }}
              </td>
              <td class="p-4 typography-text-base">
                {{ line.quantity || "--" }}
              </td>
              <td class="p-4 typography-text-base">
                {{ $currency(Number(line.priceSubtotal)) || "--" }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="flex justify-between pt-4 border-t border-neutral-200 md:border-0"
        >
          <p>{{ $t("account.myOrders.orderDetails.itemsSubtotal") }}</p>
          <span>{{ $currency(Number(order?.amountSubtotal)) }}</span>
        </div>
        <div class="flex justify-between my-2">
          <p>{{ $t("account.myOrders.orderDetails.delivery") }}</p>
          <span>{{ $currency(Number(order?.amountDelivery)) }}</span>
        </div>
        <div class="flex justify-between border-b pb-4 border-neutral-200">
          <p>{{ $t("account.myOrders.orderDetails.estimatedTax") }}</p>
          <span>{{ $currency(Number(order?.amountTax)) }}</span>
        </div>
        <div class="flex justify-between pt-4 typography-text-lg font-medium">
          <p>{{ $t("account.myOrders.orderDetails.total") }}</p>
          <span>{{ $currency(Number(order?.amountTotal)) }}</span>
        </div>
      </main>
    </UiModal>
  </UiOverlay>
  <NuxtPage />
</template>
