<script setup lang="ts">
import type { PaymentProvider } from "~/graphql";

type CheckoutPaymentProps = {
  activeProvider: PaymentProvider;
  paymentProviders: PaymentProvider[];
};

type CheckoutPaymentEmits = (
  event: "update:activePayment",
  parameter: PaymentProvider
) => void;

defineProps<CheckoutPaymentProps>();
defineEmits<CheckoutPaymentEmits>();
</script>

<template>
  <div data-testid="checkout-payment" class="md:px-4 py-6">
    <fieldset>
      <legend class="text-neutral-900 text-lg font-bold mb-4">
        {{ $t("checkoutPayment.heading") }}
      </legend>
      <div class="grid gap-4 grid-cols-2">
        <label
          v-for="provider in paymentProviders"
          :key="provider.id"
          class="relative"
        >
          <input
            type="radio"
            name="payment_method"
            class="peer sr-only"
            :value="provider.id"
            :checked="provider.id === activeProvider.id"
            @change="$emit('update:activePayment', provider)"
          >
          <span
            class="h-20 flex flex-col items-center justify-center py-4 px-4 cursor-pointer rounded-md border border-neutral-200 -outline-offset-2 hover:border-primary-200 hover:bg-primary-100 peer-focus:border-primary-200 peer-focus:bg-primary-100 active:border-primary-300 active:bg-primary-200 peer-checked:outline peer-checked:outline-2 peer-checked:outline-primary-700 peer-disabled:opacity-50 peer-disabled:bg-neutral-100 peer-disabled:border-neutral-200 peer-disabled:cursor-not-allowed peer-disabled:[&_img]:grayscale"
          >
            <span class="font-medium mt-2">{{ provider.name }}</span>
          </span>
        </label>
      </div>
    </fieldset>
  </div>
</template>
