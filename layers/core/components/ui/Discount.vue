<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

const { applyDiscount, loading } = useDiscount()
const { loadCart } = useCart()

const promo = ref<string>('')

const handleApplyPromo = async () => {
  await Promise.all([
    applyDiscount(promo.value),
    loadCart(),
  ])
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex-1">
      <SfInput
        v-model="promo"
        :placeholder="$t('checkoutPayment.promoOrGiftcard')"
      />
    </div>

    <SfButton
      :disabled="!promo || loading"
      variant="secondary"
      class="shrink-0"
      @click="handleApplyPromo"
    >
      {{ loading ? 'Applying…' : $t('apply') }}
    </SfButton>
  </div>
</template>

<style scoped></style>
