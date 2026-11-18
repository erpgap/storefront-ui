<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue'

const { applyDiscount, applying } = useDiscount()
const { loadCart } = useCart()

const promo = ref<string>('')
// What came of the last try, shown under the field: why Odoo refused the
// code, or that it was applied. Typing again clears it.
const error = ref('')
const applied = ref(false)
watch(promo, () => {
  error.value = ''
})

// The cart is reloaded once the code is in: loading it alongside showed the
// totals from before the discount.
const handleApplyPromo = async () => {
  if (!promo.value.trim() || applying.value) return
  applied.value = false
  const refused = await applyDiscount(promo.value.trim())
  if (refused) {
    error.value = refused
    return
  }
  promo.value = ''
  applied.value = true
  await loadCart()
}
</script>

<template>
  <!-- A form, so Enter applies the code too. -->
  <form
    novalidate
    @submit.prevent="handleApplyPromo"
  >
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <SfInput
          v-model="promo"
          name="promo"
          :placeholder="$t('checkoutPayment.promoOrGiftcard')"
          :aria-label="$t('checkoutPayment.promoOrGiftcard')"
          :invalid="!!error"
          :aria-invalid="!!error"
          aria-describedby="promo-code-message"
        />
      </div>

      <SfButton
        type="submit"
        :disabled="!promo.trim() || applying"
        variant="secondary"
        class="shrink-0"
      >
        {{ applying ? $t('core.ui.applying') : $t('apply') }}
      </SfButton>
    </div>
    <div
      id="promo-code-message"
      aria-live="polite"
    >
      <UiFieldError v-if="error">
        {{ error }}
      </UiFieldError>
      <p
        v-else-if="applied"
        class="mt-1 text-[12px] leading-tight text-green-700"
      >
        {{ $t('checkoutPayment.codeApplied') }}
      </p>
    </div>
  </form>
</template>
