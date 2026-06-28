<script setup lang="ts">
import type { PaymentProvider } from '~~/graphql'

type CheckoutPaymentProps = {
  activeProvider: PaymentProvider
  paymentProviders: PaymentProvider[]
}

type CheckoutPaymentEmits = (
  event: 'update:activePayment',
  parameter: PaymentProvider
) => void

const props = defineProps<CheckoutPaymentProps>()
const emit = defineEmits<CheckoutPaymentEmits>()

onMounted(() => {
  if (props.paymentProviders.length > 0) {
    emit('update:activePayment', props.paymentProviders[0])
  }
})
</script>

<template>
  <ul
    data-testid="checkout-payment"
    class="grid gap-4 sm:grid-cols-2 max-w-[640px]"
    role="radiogroup"
  >
    <li
      v-for="provider in paymentProviders"
      :key="provider.id"
    >
      <label
        :class="[
          'flex items-start gap-3 border rounded-[2px] p-4 cursor-pointer transition-colors',
          provider.id === activeProvider.id ? 'border-black shadow-[inset_0_0_0_1px_black]' : 'border-primary-200 hover:bg-primary-50',
        ]"
      >
        <input
          type="radio"
          name="payment_method"
          class="sr-only"
          :value="provider.id"
          :checked="provider.id === activeProvider.id"
          @change="$emit('update:activePayment', provider)"
        >
        <span
          class="mt-0.5 w-[18px] h-[18px] rounded-full border shrink-0 relative"
          :class="provider.id === activeProvider.id ? 'border-black' : 'border-primary-300'"
        >
          <span
            v-if="provider.id === activeProvider.id"
            class="absolute inset-[4px] rounded-full bg-black"
          />
        </span>
        <span class="min-w-0">
          <span class="block text-[14px] font-medium">{{ provider.name }}</span>
        </span>
      </label>
    </li>
  </ul>
</template>
