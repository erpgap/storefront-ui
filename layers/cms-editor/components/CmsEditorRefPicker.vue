<script setup lang="ts">
// Picks real products or categories from Odoo.
//
// The block stores ids only. Names, images, prices and stock stay live -
// storing a copy would mean a merchant's featured block quietly showing last
// month's price. This relational reference is the capability a separate
// headless CMS could not have given us without an id-sync job, and it is the
// reason the content lives in Odoo.
interface RefOption {
  id: number
  name: string
  imageUrl?: string
}

const props = defineProps<{
  modelValue: unknown
  kind: 'product' | 'category'
  max?: number
}>()

const emit = defineEmits<{ 'update:modelValue': [number[]] }>()

const selectedIds = computed<number[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue.map(Number).filter(Boolean) : [])

const search = ref('')
const open = ref(false)

// Resolving the selection separately from the search results is what makes
// already-picked items keep their names when they do not match the search box.
const { data: selected } = await useFetch<RefOption[]>('/api/cms/refs', {
  query: computed(() => ({ kind: props.kind, ids: selectedIds.value.join(',') })),
  key: computed(() => `refs-selected-${props.kind}-${selectedIds.value.join('-')}`),
  default: () => [],
  immediate: true,
})

/**
 * Fetched straight away, not only once something is typed.
 *
 * With `immediate: false` the request never fired until the merchant typed,
 * while `pending` stayed true the whole time - so opening the picker showed
 * "Searching…" forever over an empty list, and a block whose products are
 * required could not be filled in at all.
 *
 * An empty search is a real query here: it returns the first twenty products,
 * which is the list somebody wants to see when they open the picker and have
 * nothing particular in mind.
 */
const { data: results, pending } = await useFetch<RefOption[]>('/api/cms/refs', {
  query: computed(() => ({ kind: props.kind, search: search.value })),
  key: computed(() => `refs-search-${props.kind}-${search.value}`),
  default: () => [],
  watch: [search],
})

const canAdd = computed(() => props.max === undefined || selectedIds.value.length < props.max)

function add(option: RefOption) {
  if (!canAdd.value || selectedIds.value.includes(option.id)) return
  emit('update:modelValue', [...selectedIds.value, option.id])
  search.value = ''
  open.value = false
}

function remove(id: number) {
  emit('update:modelValue', selectedIds.value.filter(existing => existing !== id))
}

function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= selectedIds.value.length) return
  const next = [...selectedIds.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved!)
  emit('update:modelValue', next)
}

// Keep the selected list in the merchant's chosen order, not Odoo's.
const ordered = computed(() =>
  selectedIds.value
    .map(id => selected.value.find(option => option.id === id) ?? { id, name: `#${id}` })
    .filter(Boolean))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(option, index) in ordered"
      :key="option.id"
      class="flex items-center gap-2 rounded-md border border-primary-200 p-1.5"
    >
      <img
        v-if="option.imageUrl"
        :src="option.imageUrl"
        alt=""
        class="w-8 h-8 rounded object-cover flex-none bg-primary-100"
      >
      <span class="text-[12px] truncate flex-1">{{ option.name }}</span>
      <span class="flex items-center gap-0.5 text-primary-400 flex-none">
        <button
          type="button"
          class="px-1 text-[12px] disabled:opacity-30"
          :disabled="index === 0"
          :aria-label="`Move ${option.name} up`"
          @click="move(index, -1)"
        >↑</button>
        <button
          type="button"
          class="px-1 text-[12px] disabled:opacity-30"
          :disabled="index === ordered.length - 1"
          :aria-label="`Move ${option.name} down`"
          @click="move(index, 1)"
        >↓</button>
        <button
          type="button"
          class="px-1 text-[12px]"
          :aria-label="`Remove ${option.name}`"
          @click="remove(option.id)"
        >✕</button>
      </span>
    </div>

    <div v-if="canAdd">
      <input
        v-model="search"
        type="text"
        :placeholder="kind === 'product' ? 'Search products…' : 'Search categories…'"
        class="w-full px-2 py-1.5 text-[13px] border border-black/15 rounded"
        @focus="open = true"
      >

      <ul
        v-if="open && (results.length || pending)"
        class="mt-1 max-h-48 overflow-y-auto rounded-md border border-primary-200"
      >
        <li
          v-if="pending && !results.length"
          class="px-2 py-1.5 text-[12px] text-primary-400"
        >
          Searching…
        </li>
        <li
          v-for="option in results"
          :key="option.id"
        >
          <button
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-primary-50 disabled:opacity-40"
            :disabled="selectedIds.includes(option.id)"
            @click="add(option)"
          >
            <img
              v-if="option.imageUrl"
              :src="option.imageUrl"
              alt=""
              class="w-6 h-6 rounded object-cover flex-none bg-primary-100"
            >
            <span class="text-[12px] truncate">{{ option.name }}</span>
          </button>
        </li>
      </ul>
    </div>

    <p
      v-else
      class="text-[11px] text-primary-400"
    >
      Maximum of {{ max }} reached.
    </p>
  </div>
</template>
