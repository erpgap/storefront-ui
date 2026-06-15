<script lang="ts" setup>
import {
  SfButton,
  SfCheckbox,
  SfChip,
  SfListItem,
  SfRadio,
  SfThumbnail,
} from '@storefront-ui/vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiHelpers } from '~~/layers/category/composables/useUiHelpers'

type FacetOption = {
  id: string | number
  value?: string | number
  label: string
  total?: number
  htmlColor?: string
  values?: string
}

type Facet = {
  id: string | number | null
  label: string
  type: 'price' | 'select' | 'radio' | 'color' | 'in-stock'
  attributeName?: string
  options?: FacetOption[]
}

const emit = defineEmits<{ (e: 'close'): void }>()
const props = defineProps<{ attributes: Facet[], categories: any[] }>()

const stockCount = inject('stockCount') as number | undefined
const route = useRoute()
const router = useRouter()
const {
  changeFilters,
  selectedFilters,
  isFilterSelected,
  isStockSelected,
} = useUiHelpers()

// Shared with CategorySortDropdown; read here so applyFiltersInstantly preserves the active sort.
const sort = useState('sort', () => (route.query?.sort ? String(route.query.sort) : ''))

const facets = computed<Facet[]>(() => [
  {
    id: null,
    label: 'price',
    type: 'price',
    options: [
      { id: 'pr1', label: 'Under $250.00', values: '0-250' },
      { id: 'pr2', label: '$250.00 - $500.00', values: '250-500' },
      { id: 'pr3', label: '$500.00 - $750.00', values: '500-750' },
      { id: 'pr4', label: '$750.00 - $1000.00', values: '750-1000' },
      { id: 'pr5', label: '$1000.00 - $1500.00', values: '1000-1500' },
      { id: 'pr6', label: '$1500.00 - $2000.00', values: '1500-2000' },
    ],
  },
  ...(props.attributes ?? []),
  { id: 888, label: 'Availability', type: 'in-stock' },
])

/* function isPriceFilterSelected(values: string) {
  return selectedFilters.value.some(
    (    f: { filterName: any; id: any }) => String(f.filterName).toLowerCase() === 'price' &&
         String(f.id) === String(values)
  )
}

function selectPriceFilter(option: { id: string; label: string; values: string }) {
  const wasSelected = isPriceFilterSelected(option.values)

  selectedFilters.value = selectedFilters.value.filter((f: { filterName: string }) => f.filterName !== 'price')

  if (!wasSelected) {
    selectedFilters.value.push({
      filterName: 'price',
      label: option.id,
      id: option.values,
    })
  }

  applyFiltersInstantly()
} */

const selectedPrice = computed<string>({
  get() {
    const cur = selectedFilters.value.find((f: { filterName: any }) => String(f.filterName).toLowerCase() === 'price')
    return (cur?.id as string) || ''
  },
  set(val: string) {
    selectedFilters.value = selectedFilters.value.filter(
      (f: { filterName: any }) => String(f.filterName).toLowerCase() !== 'price',
    )
    if (val) {
      selectedFilters.value.push({
        filterName: 'price',
        label: val,
        id: val,
      })
    }
    applyFiltersInstantly()
  },
})

function togglePrice(values: string) {
  selectedPrice.value = (selectedPrice.value === values) ? '' : values
}

function isPriceChecked(values: string) {
  return selectedPrice.value === values
}

function selectStockFilter() {
  const idx = selectedFilters.value.findIndex((f: { filterName: string }) => f.filterName === 'Availability')
  if (idx !== -1) selectedFilters.value.splice(idx, 1)
  else selectedFilters.value.push({ filterName: 'Availability', label: 'true', id: 'true' })
  applyFiltersInstantly()
}

function selectFilter(facet: { label: string }, option: { id: string, value?: string | number, label: string }) {
  const token = String(option.id)
  if (isFilterSelected(option)) {
    selectedFilters.value = selectedFilters.value.filter(
      (f: { id: unknown, label: unknown }) => String(f.id) !== token && String(f.label) !== token,
    )
  }
  else {
    selectedFilters.value.push({ filterName: facet.label, label: token, id: option.id })
  }
  applyFiltersInstantly()
}

function applyFiltersInstantly() {
  const filters = selectedFilters.value.filter((x: any) => typeof x === 'object')
  changeFilters(filters, sort.value)
}

function clearFilters() {
  selectedFilters.value = []
  router.push({ path: route.path, query: {} })
  emit('close')
}
</script>

<template>
  <aside class="w-full lg:max-w-[376px] relative">
    <ul>
      <li
        v-for="(facet, index) in facets"
        :key="index"
        class="mb-6"
      >
        <h6 class="px-2 py-2 font-medium typography-headline-5 border-b border-neutral-200">
          {{ facet.label }}
        </h6>

        <!-- COLOR -->
        <div
          v-if="facet.type === 'color'"
          class="mt-4"
        >
          <SfListItem
            v-for="{ id, value, label, htmlColor, total } in facet.options!"
            :key="id"
            size="sm"
            tag="label"
            :class="['px-4 bg-transparent hover:bg-transparent', { 'font-medium': isFilterSelected({ id }) }]"
            :selected="isFilterSelected({ id })"
          >
            <template #prefix>
              <SfCheckbox
                :value="label"
                class="appearance-none peer hidden"
                :model-value="isFilterSelected({ id })"
                @update:model-value="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
              />
              <span
                class="inline-flex items-center justify-center p-1 transition duration-300 rounded-full cursor-pointer ring-1 ring-neutral-200 ring-inset
                       outline-offset-2 outline-secondary-600 peer-checked:ring-2 peer-checked:ring-primary-700 peer-hover:bg-primary-500
                       peer-[&:not(:checked):hover]:ring-primary-100 peer-active:bg-primary-200 peer-active:ring-primary-300"
              >
                <SfThumbnail
                  size="sm"
                  :style="{ backgroundColor: htmlColor as string }"
                />
              </span>
            </template>
            <div class="w-full flex justify-between cursor-pointer">
              <span>{{ label }}</span>
              <span class="text-[16px] text-[#808080]">({{ total }})</span>
            </div>
          </SfListItem>
        </div>

        <!-- PRICE -->
        <div
          v-if="facet.type === 'price'"
          class="mt-4"
        >
          <fieldset id="radio-price">
            <SfListItem
              v-for="option in facet.options"
              :key="option.id"
              tag="label"
              class="cursor-pointer hover:bg-primary-200 rounded-md transition-colors"
              @click.prevent="togglePrice((option as any).values)"
            >
              <template #prefix>
                <SfRadio
                  :model-value="isPriceChecked((option as any).values) ? (option as any).values : null"
                  :value="(option as any).values"
                  :name="'price'"
                  class="flex items-center"
                  :class="{
                    'bg-primary-700 border-primary-700 hover:bg-primary-800':
                      isPriceChecked((option as any).values),
                  }"
                />
              </template>
              <span
                class="text-sm mr-2 cursor-pointer"
                :class="{ 'font-medium': isPriceChecked((option as any).values) }"
              >
                {{ option.label }}
              </span>
            </SfListItem>
          </fieldset>
        </div>

        <!-- SELECT -->
        <ul
          v-if="facet.type === 'select'"
          class="grid grid-cols-2 gap-2 px-3 mt-4"
        >
          <li
            v-for="{ id, value, label, total } in facet.options!"
            :key="id"
          >
            <SfChip
              class="w-full"
              size="sm"
              :input-props="{ value }"
              :model-value="isFilterSelected({ id, value })"
              @update:model-value="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
            >
              <div class="w-full flex justify-center gap-2">
                <span>{{ label }}</span>
                <span class="text-[16px] text-[#808080]">({{ total }})</span>
              </div>
            </SfChip>
          </li>
        </ul>

        <ul
          v-if="facet.type === 'radio'"
          class="grid grid-cols-2 gap-2 px-3 mt-4"
        >
          <li
            v-for="{ id, value, label, total } in facet.options!"
            :key="id"
          >
            <SfChip
              class="w-full"
              size="sm"
              :input-props="{ value }"
              :model-value="isFilterSelected({ id, value })"
              @update:model-value="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
            >
              <div class="w-full flex justify-center gap-2">
                <span>{{ label }}</span>
                <span class="text-[16px] text-[#808080]">({{ total }})</span>
              </div>
            </SfChip>
          </li>
        </ul>

        <!-- IN STOCK -->
        <div
          v-if="facet.type === 'in-stock'"
          class="mt-4"
        >
          <div
            class="flex items-center gap-2 px-4 cursor-pointer"
            :class="{ 'pointer-events-none opacity-50': (stockCount ?? 0) === 0 }"
          >
            <SfCheckbox
              :model-value="isStockSelected()"
              @update:model-value="selectStockFilter()"
            />
            <div class="w-full flex justify-between">
              <span>In stock</span>
              <span class="text-[16px] text-[#808080]">({{ stockCount ?? 0 }})</span>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div class="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 lg:justify-between px-3 lg:px-0 mt-6">
      <SfButton
        variant="secondary"
        class="w-full mr-3 bg-black hover:bg-neutral-800 text-white border-none"
        @click="clearFilters"
      >
        {{ $t('clearFilters') }}
      </SfButton>
    </div>
  </aside>
</template>
