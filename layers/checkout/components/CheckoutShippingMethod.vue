<script setup lang="ts">
import { SfIconBlock } from '@storefront-ui/vue'

const {
  deliveryMethods,
  loadDeliveryMethods,
  setDeliveryMethod,
  setDeliveryMethodImmediate,
} = useDeliveryMethod()

const radioModel = ref('')

defineProps({
  step: { type: [String, Number], default: '' },
  shippingDate: {
    type: String,
    default: 'tomorrow',
  },
})

await loadDeliveryMethods()

if (deliveryMethods?.value?.length) {
  radioModel.value = String(deliveryMethods.value[0]?.id)
  await setDeliveryMethodImmediate(deliveryMethods.value[0]?.id)
}

const handleSelectShippingMethod = async (shippingMethodId: number) => {
  radioModel.value = String(shippingMethodId)
  await setDeliveryMethod(shippingMethodId)
}

const sectionEl = ref<HTMLElement>()
const valid = computed(() => !!radioModel.value)
defineExpose({
  validate(): HTMLElement | null {
    return valid.value ? null : sectionEl.value ?? null
  },
})
</script>

<template>
  <section
    ref="sectionEl"
    class="py-7"
    data-testid="shipping-method"
  >
    <div class="flex items-center gap-3 mb-5">
      <span
        v-if="step"
        :class="[
          'w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] shrink-0',
          valid ? 'bg-black text-white' : 'border border-primary-200 text-primary-500',
        ]"
      >
        <template v-if="valid">✓</template>
        <template v-else>{{ step }}</template>
      </span>
      <h2 class="text-[13px] tracking-[0.14em] uppercase font-semibold">
        {{ $t("shippingMethod.heading") }}
      </h2>
    </div>

    <div class="md:pl-[38px]">
      <ul
        v-if="deliveryMethods.length"
        class="grid gap-4 sm:grid-cols-2 max-w-[640px]"
        role="radiogroup"
      >
        <li
          v-for="method in deliveryMethods"
          :key="method.id"
        >
          <label
            :class="[
              'flex items-start gap-3 border rounded-[2px] p-4 cursor-pointer transition-colors',
              radioModel === String(method.id) ? 'border-black shadow-[inset_0_0_0_1px_black]' : 'border-primary-200 hover:bg-primary-50',
            ]"
            @click="handleSelectShippingMethod(method.id)"
          >
            <span
              class="mt-0.5 w-[18px] h-[18px] rounded-full border shrink-0 relative"
              :class="radioModel === String(method.id) ? 'border-black' : 'border-primary-300'"
            >
              <span
                v-if="radioModel === String(method.id)"
                class="absolute inset-[4px] rounded-full bg-black"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-[14px] font-medium">{{ method.name }}</span>
              <span class="block text-[12px] text-primary-400 mt-0.5">{{ shippingDate }}</span>
            </span>
            <span
              v-if="(method as any).price != null"
              class="ml-auto text-[14px] font-medium whitespace-nowrap"
            >
              {{ Number((method as any).price) > 0 ? $currency(Number((method as any).price)) : $t('free') }}
            </span>
          </label>
        </li>
      </ul>

      <div
        v-else
        class="flex items-center gap-2 text-primary-500"
      >
        <SfIconBlock />
        <p>{{ $t("shippingMethod.description") }}</p>
      </div>
    </div>
  </section>
</template>
