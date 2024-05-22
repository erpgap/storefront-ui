<script setup lang="ts">
type SearchHitEmit = (event: "select", parameter: AlgoliaHitType) => void;
type SearchClerkProps = {
  hits?: AlgoliaHitType[];
  searchText: string;
};

const props = defineProps<SearchClerkProps>();
defineEmits<SearchHitEmit>();

const makeSearchBold = (text: string) => {
  return text
    .toLocaleLowerCase()
    .replace(
      props.searchText,
      `<b class='font-extrabold text-[16px] capitalize'>${props.searchText}</b>`
    );
};
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
      role="option"
      @click="$emit('select', hit)"
    >
      <span
        class="text-black text-sm font-medium capitalize"
        v-html="makeSearchBold(hit.name)"
      >
      </span>
    </li>
  </ul>
</template>
