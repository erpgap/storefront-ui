<template>
  <SfAccordionItem v-model="internalModelValue" :summary-class="summaryClass" data-testid="accordion-item">
    <template #summary>
      <slot name="summary">
        <p>{{ summary }}</p>
      </slot>
      <SfIconChevronLeft :class="['text-neutral-500', modelValue ? 'rotate-90' : '-rotate-90']" />
    </template>
    <div class="py-2 lg:px-4">
      <slot />
    </div>
  </SfAccordionItem>
</template>

<script lang="ts" setup>
import { SfAccordionItem, SfIconChevronLeft } from '@storefront-ui/vue';
import { useVModel } from '@vueuse/core';

type AccordionItemProps = {
  modelValue?: boolean;
  summary?: string;
  summaryClass?: string;
};

const props = withDefaults(defineProps<AccordionItemProps>(), {
  modelValue: false,
  summary: '',
  summaryClass: '',
});
const emit = defineEmits(['update:modelValue']);

const internalModelValue = useVModel(props, 'modelValue', emit, {
  passive: true,
});
</script>
