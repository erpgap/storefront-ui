<script setup lang="ts">
import { SfButton, SfIconAdd, SfIconRemove, useId } from '@storefront-ui/vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  maxQty: {
    type: Number,
    required: false,
    default: 10,
  },
});
const emit = defineEmits(['update:modelValue']);

const increment = () => {
  if (props.modelValue < props.maxQty) {
    emit('update:modelValue', props.modelValue + 1);
  }
};

const decrement = () => {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1);
  }
};

const handleUpdate = (event: Event) => {
  if (props.modelValue < props.maxQty && props.modelValue > 1) {
    emit('update:modelValue', (event?.target as any)?.value);
  }
};
</script>
<template>
  <div class="inline-flex flex-col items-center" data-testid="quantity-selector">
    <div class="flex border border-neutral-300 rounded-md h-full w-full">
      <SfButton
        type="button"
        variant="tertiary"
        square
        class="rounded-r-none"
        aria-label="Decrease value"
        data-testid="quantity-selector-decrease-button"
        @click="decrement"
      >
        <SfIconRemove />
      </SfButton>
      <input
        class="appearance-none flex-1 mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:display-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:display-none [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none disabled:placeholder-disabled-900 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm"
        :max="props.maxQty"
        :value="props.modelValue"
        type="number"
        role="spinbutton"
        data-testid="quantity-selector-input"
        aria-label="Quantity Selector"
        @input="handleUpdate"
      >
      <SfButton
        type="button"
        variant="tertiary"
        square
        class="rounded-l-none"
        aria-label="Increase value"
        data-testid="quantity-selector-increase-button"
        @click="increment"
      >
        <SfIconAdd />
      </SfButton>
    </div>
  </div>
</template>
