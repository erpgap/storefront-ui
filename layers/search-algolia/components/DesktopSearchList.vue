<script setup lang="ts">
type AlgoliaHitType = { objectID: string; name: string } // ajuste ao seu tipo

type SearchHitEmit = (e: 'select', payload: AlgoliaHitType) => void
type SearchClerkProps = {
  hits?: AlgoliaHitType[]
  searchText: string
}

const props = defineProps<SearchClerkProps>()
defineEmits<SearchHitEmit>()

// escapa caracteres especiais de regex
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const makeSearchBold = (text: string) => {
  const q = (props.searchText || '').trim()
  if (!q) return text
  const re = new RegExp(escapeRegExp(q), 'ig')
  return text.replace(
    re,
    (m) => `<b class="font-extrabold text-[16px] capitalize">${m}</b>`
  )
}
</script>

<template>
  <ul
    tabindex="-1"
    role="listbox"
    class="absolute top-12 bg-white shadow-md rounded-md w-full overflow-hidden"
  >
    <li
      v-for="(hit, index) in (props.hits || [])"
      :key="hit.objectID"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      role="option"
      :aria-selected="false"
      @click="$emit('select', hit)"
    >
      <span
        class="text-black text-sm font-medium capitalize"
        v-html="makeSearchBold(hit.name)"
      />
    </li>
  </ul>
</template>
