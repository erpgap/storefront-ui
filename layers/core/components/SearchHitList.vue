<script setup lang="ts">
// The suggestions under the search box, for Odoo's results and Algolia's
// alike: a dropdown in the desktop header, a plain list in the mobile menu.

type SearchHit = { id?: number | string, objectID?: string, name?: string | null }

const props = defineProps<{
  hits?: SearchHit[]
  searchText: string
  dropdown?: boolean
}>()
defineEmits<(event: 'select', hit: any) => void>()

// The typed text in bold. Split rather than built as HTML: the text comes
// from the input, which ?search= in the URL fills.
const rows = computed(() => {
  const query = props.searchText.trim().toLocaleLowerCase()
  return (props.hits ?? []).map((hit) => {
    const text = (hit.name ?? '').toLocaleLowerCase()
    const at = query ? text.indexOf(query) : -1
    return at < 0
      ? { hit, before: text, match: '', after: '' }
      : { hit, before: text.slice(0, at), match: text.slice(at, at + query.length), after: text.slice(at + query.length) }
  })
})
</script>

<template>
  <ul
    v-if="rows.length"
    tabindex="-1"
    role="listbox"
    class="bg-white rounded-md w-full overflow-hidden"
    :class="dropdown ? 'absolute top-12 shadow-md z-60' : 'space-y-2'"
  >
    <li
      v-for="row in rows"
      :key="row.hit.objectID ?? row.hit.id"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      role="option"
      @click="$emit('select', row.hit)"
    >
      <span class="text-black text-sm font-medium capitalize">{{ row.before }}<b
        v-if="row.match"
        class="font-extrabold text-[16px] capitalize"
      >{{ row.match }}</b>{{ row.after }}</span>
    </li>
  </ul>
  <LazySearchNoResult
    v-else
    :search-text="searchText"
  />
</template>
