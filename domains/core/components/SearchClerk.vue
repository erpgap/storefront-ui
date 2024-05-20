<script setup lang="ts">
type SearchHitEmit = (event: "select", parameter: AlgoliaHitType) => void;
type SearchClerkProps = {
  hits?: AlgoliaHitType[];
  highlightedIndex: number;
};

defineProps<SearchClerkProps>();
defineEmits<SearchHitEmit>();
</script>
<template>
  <ul
    tabindex="-1"
    role="listbox"
    class="absolute top-12 bg-white shadow-md rounded-md w-full overflow-hidden"
  >
    <li
      v-for="(hit, index) in hits"
      :key="hit.objectID"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      :class="{ 'bg-gray-100': highlightedIndex === index }"
      role="option"
      @click="$emit('select', hit)"
    >
      <p class="text-black text-sm font-medium">
        {{ hit.name }}
      </p>
    </li>
  </ul>
</template>
