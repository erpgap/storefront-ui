<script lang="ts" setup>
import { SfButton, SfIconSort, SfIconExpandMore, SfIconCheck, useDropdown } from '@storefront-ui/vue'
import { useRoute } from 'vue-router'
import { useUiHelpers } from '~~/layers/category/composables/useUiHelpers'

type SortOption = { id: string; value: string; attrName: string }

const sortOptions: SortOption[] = [
  { id: 'name-asc', value: 'name,ASC', attrName: 'Name: A to Z' },
  { id: 'name-desc', value: 'name,DESC', attrName: 'Name: Z to A' },
  { id: 'price-asc', value: 'price,ASC', attrName: 'Price: Low to High' },
  { id: 'price-desc', value: 'price,DESC', attrName: 'Price: High to Low' },
]

const route = useRoute()
const { changeFilters, selectedFilters } = useUiHelpers()

const sort = useState('sort', () => (route.query?.sort ? String(route.query.sort) : ''))
const selectedValue = computed(() => sort.value || sortOptions[0]!.value)
const selectedLabel = computed(
  () => sortOptions.find(option => option.value === selectedValue.value)?.attrName ?? '',
)
const isActive = (value: string) => selectedValue.value === value

const dropdownOpened = ref(false)
const toggle = () => { dropdownOpened.value = !dropdownOpened.value }
const close = () => { dropdownOpened.value = false }
const { referenceRef, floatingRef } = useDropdown({ dropdownOpened, onClose: close })

function selectSort(value: string) {
  sort.value = value
  const filters = selectedFilters.value.filter((filter: unknown) => typeof filter === 'object')
  changeFilters(filters, sort.value)
  close()
}
</script>

<template>
  <div
    ref="referenceRef"
    class="relative"
  >
    <SfButton
      variant="tertiary"
      class="whitespace-nowrap"
      type="button"
      :aria-label="$t('sortBy')"
      :aria-expanded="dropdownOpened"
      @click="toggle"
    >
      <span class="hidden sm:inline">{{ $t('sortBy') }}:&nbsp;</span>{{ selectedLabel }}
      <template #suffix>
        <SfIconExpandMore
          size="sm"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': dropdownOpened }"
        />
      </template>
    </SfButton>

    <ul
      v-if="dropdownOpened"
      ref="floatingRef"
      class="absolute right-0 mt-1 py-2 min-w-[220px] bg-white rounded-md shadow-md border border-neutral-100 z-50"
    >
      <li
        v-for="option in sortOptions"
        :key="option.id"
      >
        <button
          type="button"
          class="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-primary-100 transition-colors"
          :class="{ 'font-medium text-primary-700': isActive(option.value) }"
          @click="selectSort(option.value)"
        >
          {{ option.attrName }}
          <SfIconCheck
            v-if="isActive(option.value)"
            size="sm"
            class="text-primary-700"
          />
        </button>
      </li>
    </ul>
  </div>
</template>
