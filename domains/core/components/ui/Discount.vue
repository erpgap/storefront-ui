<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

const { applyDiscount, loading } = useDiscount()

const promo = ref('')

const handleApplyPromo = async () => {
  await applyDiscount(promo.value)
}
</script>

<template>
  <div class="w-full py-4 flex items-center gap-4">
    <div class="w-full">
      <SfInput
        v-model="promo"
        size="lg"
        :placeholder="$t('checkoutPayment.promoOrGiftcard')"
      />
    </div>

    <SfButton
      :disabled="!promo || loading"
      size="lg"
      variant="secondary"
      @click="handleApplyPromo"
    >
      {{ $t('apply') }}
    </SfButton>
  </div>
</template>

<style scoped></style>
