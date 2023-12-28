<script lang="ts" setup>
import { SfButton, SfIconArrowBack } from '@storefront-ui/vue';

const { cart, loadCart } = useCart();

const data:any = ref([
  {
    id: 1,
    attributes: [
      {
        name: 'Size',
        label: '40',
      },
      {
        name: 'Color',
        label: 'White',
      },
    ],
    imageUrl: null,
    imageAlt: 'athletic-mens-walking-sneakers',
    maxValue: 20,
    minValue: 1,
    name: 'athletic-mens-walking-sneakers',
    price: '89.95',
    specialPrice: '100.99',
    quantity: 10,
    slug: '/product/1',
  },
]);

await loadCart();

</script>

<template>
  <div v-if="cart?.order?.websiteOrderLine?.length > 0" class="pb-20">
    <div class="flex justify-between mt-8 mb-10">
      <h1 class="font-bold typography-headline-3 md:typography-headline-2">
        Cart
      </h1>
      <SfButton
        to="/cart"
        class="flex md:hidden whitespace-nowrap"
        size="sm"
        variant="tertiary"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t('back') }}
      </SfButton>
      <SfButton
        to="/cart"
        class="hidden md:flex"
        variant="tertiary"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t('backToShopping') }}
      </SfButton>
    </div>
    <div
      class="lg:grid lg:grid-cols-12 md:gap-x-6"
      data-testid="cart-page-content"
    >
      <div class="col-span-7 mb-10 lg:mb-0">
        <div
          v-for="orderLine in cart.order?.orderLines"
          :key="orderLine?.id"
        >
          <CartCollectedProductCard
            :attributes="attributes"
            :image-url="orderLine?.product?.image"
            :image-alt="orderLine?.product?.imageFilename"
            :name="orderLine?.product?.name || `-`"
            :price="orderLine?.product?.name"
            :special-price="orderLine?.product?.name"
            :max-value="10"
            :min-value="1"
            :value="orderLine.quantity"
            :slug="slug"
          />
        </div>
      </div>

      <UiOrderSummary :cart="cart" class="col-span-5 md:sticky md:top-20 h-fit">
        <SfButton
          to="/checkout"
          size="lg"
          class="w-full mb-4 md:mb-0"
        >
          {{ $t('goToCheckout') }}
        </SfButton>
      </UiOrderSummary>
    </div>
  </div>
  <div
    v-else
    class="flex items-center justify-center flex-col pt-24 pb-32"
    data-testid="cart-page-content"
  >
    <NuxtImg
      src="/images/empty-cart.svg"
      :alt="$t('emptyCartImgAlt')"
      width="192"
      height="192"
    />
    <h2 class="mt-8">{{ $t('emptyCart') }}</h2>
  </div>
</template>
