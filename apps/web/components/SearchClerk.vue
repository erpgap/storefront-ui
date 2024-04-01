<script setup lang="ts">
import { AlgoliaHitType } from "@/types/algolia";

type SearchClerkProps = {
  hits?: AlgoliaHitType[];
};

type SearchHitEmit = (event: "select", parameter: AlgoliaHitType) => void;

defineProps<SearchClerkProps>();
defineEmits<SearchHitEmit>();
</script>
<template>
  <ul
    tabindex="-1"
    role="listbox"
    class="absolute top-12 bg-white shadow-md rounded-md w-full py-1"
  >
    <li
      v-for="hit in hits"
      :key="hit.objectID"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      role="option"
      @click="$emit('select', hit)"
    >
      <p class="text-black text-sm font-medium">
        {{ hit.name }}
      </p>
    </li>
  </ul>
</template>
