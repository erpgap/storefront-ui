<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

const { applyDiscount, applying } = useDiscount()
const { loadCart } = useCart()

const promo = ref<string>('')

// The cart is reloaded once the code is in: loading it alongside showed the
// totals from before the discount.
const handleApplyPromo = async () => {
  if (await applyDiscount(promo.value)) {
    promo.value = ''
    await loadCart()
  }
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
      :disabled="!promo || applying"
      variant="secondary"
      class="shrink-0"
      @click="handleApplyPromo"
    >
      {{ applying ? $t('core.ui.applying') : $t('apply') }}
    </SfButton>
  </div>
</template>

<style scoped></style>
