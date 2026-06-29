<script lang="ts" setup>
import { SfButton, SfIconExpandMore, SfIconCheck, SfIconClose } from '@storefront-ui/vue'
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

type FacetGroup = { label: string, options: FacetOption[] }

type Facet = {
  id: string | number | null
  label: string
  type: 'price' | 'select' | 'radio' | 'color' | 'in-stock' | 'category'
  attributeName?: string
  options?: FacetOption[]
  groups?: FacetGroup[]
}

const emit = defineEmits<{ (e: 'close'): void }>()
const props = defineProps<{
  attributes: Facet[]
  categories: any[]
  minPrice?: number | null
  maxPrice?: number | null
}>()

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

// Category filter — only on the full catalog (/products). Category pages are
// already scoped to a category. Grouped by parent so duplicate leaf names
// (e.g. Bags under both Women and Men) are unambiguous.
const { categoriesForMegaMenu } = useMegaMenuCategories()
const showCategoryFilter = computed(() => route.path === '/products')
const categoryGroups = computed<FacetGroup[]>(() =>
  (categoriesForMegaMenu.value || [])
    .map((top: any) => ({
      label: String(top?.name ?? ''),
      options: (top?.childs || []).map((c: any) => ({ id: c.id, label: String(c.name ?? '') })),
    }))
    .filter(g => g.label && g.options.length),
)

const facets = computed<Facet[]>(() => [
  ...(showCategoryFilter.value && categoryGroups.value.length
    ? [{ id: 'category', label: 'category', type: 'category', groups: categoryGroups.value } as Facet]
    : []),
  { id: null, label: 'price', type: 'price' },
  ...(props.attributes ?? []),
  // Availability/in-stock filter hidden for now — it relies on Odoo stock via
  // the GraphQL API (slow); stock is served from Redis elsewhere. All the
  // supporting logic and template are kept intact below — re-enable by
  // uncommenting this line.
  // { id: 888, label: 'Availability', type: 'in-stock' },
])

/* ---------------- price (dual range) ----------------
 * Bounds come from the category's real min/max price and snap to a "nice"
 * increment scaled to the range, so handles land on round numbers rather than
 * dragging freely over an arbitrary 0–2000 track.
 */
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
      selectedFilters.value.push({ filterName: 'price', label: val, id: val })
    }
    applyFiltersInstantly()
  },
})

function niceStep(span: number): number {
  if (span <= 100) return 5
  if (span <= 500) return 10
  if (span <= 1000) return 25
  if (span <= 2000) return 50
  return 100
}
function computeBounds(lo: number, hi: number) {
  const step = niceStep(hi - lo)
  return {
    min: Math.max(0, Math.floor(lo / step) * step),
    max: Math.ceil(hi / step) * step,
    step,
  }
}

// Persist bounds per category and only refresh them when no price filter is
// active, so applying a price filter never shrinks the selectable range.
const storedBounds = useState<{ min: number, max: number, step: number } | null>(
  `price-bounds-${route.path}`,
  () => null,
)
watchEffect(() => {
  const lo = props.minPrice
  const hi = props.maxPrice
  if (!selectedPrice.value && lo != null && hi != null && hi > lo) {
    const next = computeBounds(lo, hi)
    const cur = storedBounds.value
    // Expand-only: keep the widest range seen for this category so paginating
    // (when bounds are derived from page products) never shrinks the slider.
    if (!cur) {
      storedBounds.value = next
    }
    else {
      const min = Math.min(cur.min, next.min)
      const max = Math.max(cur.max, next.max)
      storedBounds.value = { min, max, step: niceStep(max - min) }
    }
  }
})
// No stored bounds = the category has no usable price spread (API returned an
// empty/equal range and products are uniformly priced). Use a degenerate range
// so the price facet shows a "no range" note rather than a dead 0–2000 slider.
const bounds = computed(() => storedBounds.value ?? { min: 0, max: 0, step: 50 })
const hasPriceRange = computed(() => bounds.value.max > bounds.value.min)

const priceMin = ref(bounds.value.min)
const priceMax = ref(bounds.value.max)

watchEffect(() => {
  const cur = selectedPrice.value
  if (cur && cur.includes('-')) {
    const [a, b] = cur.split('-')
    priceMin.value = Number(a) || bounds.value.min
    priceMax.value = Number(b) || bounds.value.max
  }
  else {
    priceMin.value = bounds.value.min
    priceMax.value = bounds.value.max
  }
})

function onMinInput() {
  const { min, max, step } = bounds.value
  if (priceMin.value > priceMax.value - step) priceMin.value = priceMax.value - step
  if (priceMin.value < min) priceMin.value = min
  if (priceMin.value > max) priceMin.value = max
}
function onMaxInput() {
  const { min, max, step } = bounds.value
  if (priceMax.value < priceMin.value + step) priceMax.value = priceMin.value + step
  if (priceMax.value > max) priceMax.value = max
  if (priceMax.value < min) priceMax.value = min
}
function commitPrice() {
  const { min, max } = bounds.value
  const changed = priceMin.value > min || priceMax.value < max
  selectedPrice.value = changed ? `${priceMin.value}-${priceMax.value}` : ''
}
function commitPriceFromText() {
  onMinInput()
  onMaxInput()
  commitPrice()
}
const priceFill = computed(() => {
  const { min, max } = bounds.value
  const span = Math.max(1, max - min)
  return {
    left: `${((priceMin.value - min) / span) * 100}%`,
    right: `${100 - ((priceMax.value - min) / span) * 100}%`,
  }
})

/* ---------------- attribute + stock selection ---------------- */
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
}

/* ---------------- accordion ---------------- */
const collapsed = reactive<Record<string, boolean>>({})
const facetKey = (facet: Facet, index: number) => `${facet.label}-${index}`
const isOpen = (facet: Facet, index: number) => !collapsed[facetKey(facet, index)]
const toggleFacet = (facet: Facet, index: number) => {
  const k = facetKey(facet, index)
  collapsed[k] = !collapsed[k]
}

/* ---------------- search within long facets ---------------- */
const searchTerms = reactive<Record<string, string>>({})
function visibleOptions(facet: Facet, index: number): FacetOption[] {
  const opts = facet.options ?? []
  const term = (searchTerms[facetKey(facet, index)] ?? '').trim().toLowerCase()
  if (!term) return opts
  return opts.filter(o => String(o.label).toLowerCase().includes(term))
}
const showSearch = (facet: Facet) => (facet.options?.length ?? 0) > 10

// Size-like facets (short labels) render as tiles; everything else as a list.
function isTileFacet(facet: Facet): boolean {
  if (facet.type !== 'select' && facet.type !== 'radio') return false
  const opts = facet.options ?? []
  return opts.length > 0 && opts.every(o => String(o.label).trim().length <= 4)
}

/* ---------------- selected counts + active pills ---------------- */
function selectedCount(facet: Facet): number {
  if (facet.type === 'price') return selectedPrice.value ? 1 : 0
  if (facet.type === 'in-stock') return isStockSelected() ? 1 : 0
  return selectedFilters.value.filter((f: { filterName: any }) => String(f.filterName) === String(facet.label)).length
}

const optionLabelById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const f of facets.value) {
    for (const o of (f.options ?? [])) map[String(o.id)] = o.label
    for (const g of (f.groups ?? [])) for (const o of g.options) map[String(o.id)] = o.label
  }
  return map
})

type Pill = { key: string, type: 'price' | 'availability' | 'attr', display: string, min?: number, max?: number, filterName?: string, id?: string }

const activePills = computed<Pill[]>(() =>
  selectedFilters.value
    .filter((f: any) => typeof f === 'object')
    .map((f: any): Pill => {
      const fn = String(f.filterName).toLowerCase()
      if (fn === 'price') {
        const [a, b] = String(f.id).split('-')
        return { key: `price`, type: 'price', display: '', min: Number(a) || 0, max: Number(b) || PRICE_MAX }
      }
      if (f.filterName === 'Availability') {
        return { key: 'availability', type: 'availability', display: 'In stock' }
      }
      return {
        key: `${f.filterName}:${f.id}`,
        type: 'attr',
        display: optionLabelById.value[String(f.id)] ?? String(f.label),
        filterName: String(f.filterName),
        id: String(f.id),
      }
    }),
)

function removePill(pill: Pill) {
  if (pill.type === 'price') {
    selectedPrice.value = ''
    return
  }
  if (pill.type === 'availability') {
    selectStockFilter()
    return
  }
  selectedFilters.value = selectedFilters.value.filter(
    (f: any) => !(String(f.filterName) === pill.filterName && String(f.id) === pill.id),
  )
  applyFiltersInstantly()
}

const hasActive = computed(() => activePills.value.length > 0)
</script>

<template>
  <aside class="w-full lg:max-w-[320px] relative">
    <!-- header -->
    <div class="flex items-baseline justify-between pb-3.5 border-b-2 border-primary-900">
      <h2 class="text-[13px] tracking-[0.2em] uppercase font-semibold">
        {{ $t('refineBy') }}
      </h2>
      <button
        v-if="hasActive"
        type="button"
        class="text-xs text-primary-400 hover:text-primary-900 underline underline-offset-[3px]"
        @click="clearFilters"
      >
        {{ $t('clearFilters') }}
      </button>
    </div>

    <!-- active filter pills -->
    <div
      v-if="hasActive"
      class="flex flex-wrap gap-2 pt-4 pb-1"
      aria-live="polite"
    >
      <span
        v-for="pill in activePills"
        :key="pill.key"
        class="inline-flex items-center gap-2 bg-primary-900 text-white rounded-md text-xs leading-none pl-3 pr-2 py-1.5"
      >
        <span v-if="pill.type === 'price'">{{ $currency(pill.min || 0) }} – {{ $currency(pill.max || 0) }}</span>
        <span v-else>{{ pill.display }}</span>
        <button
          type="button"
          class="opacity-70 hover:opacity-100 flex"
          :aria-label="`Remove ${pill.display || 'price'} filter`"
          @click="removePill(pill)"
        >
          <SfIconClose size="xs" />
        </button>
      </span>
    </div>

    <!-- facets -->
    <section
      v-for="(facet, index) in facets"
      :key="facetKey(facet, index)"
      class="border-b border-neutral-200"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between py-5 text-left"
        :aria-expanded="isOpen(facet, index)"
        @click="toggleFacet(facet, index)"
      >
        <span class="flex items-center">
          <span class="text-xs tracking-[0.14em] uppercase font-semibold">{{ facet.label }}</span>
          <span
            v-if="selectedCount(facet)"
            class="ml-2.5 inline-grid place-items-center min-w-[18px] h-[18px] px-1.5 rounded-md bg-primary-900 text-white text-[11px] font-semibold"
          >{{ selectedCount(facet) }}</span>
        </span>
        <SfIconExpandMore
          size="sm"
          class="text-primary-500 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen(facet, index) }"
        />
      </button>

      <div
        v-show="isOpen(facet, index)"
        class="pb-6"
      >
        <!-- CATEGORY (grouped by parent) -->
        <div v-if="facet.type === 'category'" class="space-y-4">
          <div
            v-for="group in facet.groups"
            :key="group.label"
          >
            <p class="text-[11px] tracking-[0.12em] uppercase text-primary-400 mb-1.5">
              {{ group.label }}
            </p>
            <label
              v-for="{ id, label } in group.options"
              :key="id"
              class="flex items-center gap-3 py-3 lg:py-1.5 px-1 -mx-1 rounded-md cursor-pointer hover:bg-primary-50"
            >
              <span
                class="w-5 h-5 lg:w-4 lg:h-4 flex-none grid place-items-center border-[1.5px] rounded-md transition-colors"
                :class="isFilterSelected({ id }) ? 'bg-primary-900 border-primary-900' : 'border-primary-300'"
              >
                <SfIconCheck
                  v-if="isFilterSelected({ id })"
                  size="xs"
                  class="text-white"
                />
              </span>
              <input
                type="checkbox"
                class="hidden"
                :checked="isFilterSelected({ id })"
                @change="selectFilter(facet as any, { id: String(id), label: String(label) })"
              >
              <span
                class="flex-1 text-base lg:text-sm"
                :class="{ 'font-medium': isFilterSelected({ id }) }"
              >{{ label }}</span>
            </label>
          </div>
        </div>

        <!-- PRICE -->
        <div v-else-if="facet.type === 'price'">
          <template v-if="hasPriceRange">
            <div class="price-range relative h-[30px] mx-0.5">
              <div class="absolute top-[13px] inset-x-0 h-[3px] bg-primary-100 rounded-sm" />
              <div
                class="absolute top-[13px] h-[3px] bg-primary-900 rounded-sm"
                :style="priceFill"
              />
              <input
                v-model.number="priceMin"
                type="range"
                :min="bounds.min"
                :max="bounds.max"
                :step="bounds.step"
                aria-label="Minimum price"
                @input="onMinInput"
                @change="commitPrice"
              >
              <input
                v-model.number="priceMax"
                type="range"
                :min="bounds.min"
                :max="bounds.max"
                :step="bounds.step"
                aria-label="Maximum price"
                @input="onMaxInput"
                @change="commitPrice"
              >
            </div>
            <div class="flex justify-between mt-1.5 text-[11px] text-primary-300 tabular-nums">
              <span>{{ $currency(bounds.min) }}</span>
              <span>{{ $currency(bounds.max) }}</span>
            </div>
            <div class="flex items-center gap-2.5 mt-3">
              <label class="flex-1 flex items-center h-[38px] px-2.5 border border-neutral-200 rounded-md focus-within:border-primary-900">
                <span class="text-primary-300 text-[13px]">$</span>
                <input
                  v-model.number="priceMin"
                  inputmode="numeric"
                  class="w-full min-w-0 pl-1 text-[13px] outline-none tabular-nums"
                  aria-label="Minimum price value"
                  @change="commitPriceFromText"
                >
              </label>
              <span class="text-primary-300">–</span>
              <label class="flex-1 flex items-center h-[38px] px-2.5 border border-neutral-200 rounded-md focus-within:border-primary-900">
                <span class="text-primary-300 text-[13px]">$</span>
                <input
                  v-model.number="priceMax"
                  inputmode="numeric"
                  class="w-full min-w-0 pl-1 text-[13px] outline-none tabular-nums"
                  aria-label="Maximum price value"
                  @change="commitPriceFromText"
                >
              </label>
            </div>
          </template>
          <p
            v-else
            class="text-[13px] text-primary-400"
          >
            No price range available
          </p>
        </div>

        <!-- COLOR -->
        <div
          v-else-if="facet.type === 'color'"
          class="grid grid-cols-5 gap-x-2.5 gap-y-3"
        >
          <button
            v-for="{ id, value, label, htmlColor } in facet.options!"
            :key="id"
            type="button"
            class="group flex flex-col items-center gap-1.5"
            :title="label"
            @click="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
          >
            <span
              class="relative w-full aspect-square rounded-md border border-black/10 transition-transform group-hover:-translate-y-0.5"
              :class="{ 'ring-2 ring-primary-900 ring-offset-2': isFilterSelected({ id }) }"
              :style="{ backgroundColor: htmlColor as string }"
            >
              <span
                v-if="isFilterSelected({ id })"
                class="absolute inset-0 grid place-items-center text-white mix-blend-difference"
              >
                <SfIconCheck size="sm" />
              </span>
            </span>
            <span
              class="text-[10.5px] capitalize"
              :class="isFilterSelected({ id }) ? 'text-primary-900' : 'text-primary-400'"
            >{{ label }}</span>
          </button>
        </div>

        <!-- SIZE-LIKE TILES -->
        <div
          v-else-if="isTileFacet(facet)"
          class="grid grid-cols-4 gap-2"
        >
          <button
            v-for="{ id, value, label } in facet.options!"
            :key="id"
            type="button"
            class="py-2.5 text-[13px] tracking-wide border rounded-md transition-colors"
            :class="isFilterSelected({ id })
              ? 'bg-primary-900 text-white border-primary-900'
              : 'border-neutral-200 text-primary-900 hover:border-primary-400'"
            @click="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
          >
            {{ label }}
          </button>
        </div>

        <!-- SELECT / RADIO LIST -->
        <div v-else-if="facet.type === 'select' || facet.type === 'radio'">
          <div
            v-if="showSearch(facet)"
            class="relative mb-3"
          >
            <input
              v-model="searchTerms[facetKey(facet, index)]"
              type="text"
              :placeholder="`Search ${facet.label.toLowerCase()}`"
              class="w-full border border-neutral-200 rounded-md py-2.5 pl-8 pr-3 text-[13px] outline-none focus:border-primary-900"
            >
            <svg
              class="absolute left-2.5 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a3a3a3"
              stroke-width="2"
            ><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </div>

          <label
            v-for="{ id, value, label, total } in visibleOptions(facet, index)"
            :key="id"
            class="flex items-center gap-3 py-3 lg:py-1.5 px-1 -mx-1 rounded-md cursor-pointer hover:bg-primary-50"
          >
            <span
              class="w-5 h-5 lg:w-4 lg:h-4 flex-none grid place-items-center border-[1.5px] rounded-md transition-colors"
              :class="isFilterSelected({ id, value }) ? 'bg-primary-900 border-primary-900' : 'border-primary-300'"
            >
              <SfIconCheck
                v-if="isFilterSelected({ id, value })"
                size="xs"
                class="text-white"
              />
            </span>
            <input
              type="checkbox"
              class="hidden"
              :checked="isFilterSelected({ id, value })"
              @change="selectFilter(facet as any, { id: String(id), value: value as any, label: String(label) })"
            >
            <span
              class="flex-1 text-base lg:text-sm"
              :class="{ 'font-medium': isFilterSelected({ id, value }) }"
            >{{ label }}</span>
            <span class="text-xs text-primary-300 tabular-nums">{{ total }}</span>
          </label>
        </div>

        <!-- IN STOCK -->
        <div
          v-else-if="facet.type === 'in-stock'"
          class="flex items-center justify-between"
          :class="{ 'pointer-events-none opacity-50': (stockCount ?? 0) === 0 }"
        >
          <div>
            <div class="text-sm">
              In stock only
            </div>
            <div class="text-xs text-primary-400 mt-0.5">
              {{ stockCount ?? 0 }} available
            </div>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isStockSelected()"
            aria-label="In stock only"
            class="relative w-[42px] h-6 rounded-md transition-colors flex-none"
            :class="isStockSelected() ? 'bg-primary-900' : 'bg-primary-200'"
            @click="selectStockFilter()"
          >
            <span
              class="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-sm shadow transition-all"
              :class="isStockSelected() ? 'left-[21px]' : 'left-[3px]'"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- mobile apply -->
    <SfButton
      class="w-full mt-6 bg-primary-900 hover:bg-primary-700 text-white border-none lg:hidden"
      @click="emit('close')"
    >
      {{ $t('showProducts') || 'View results' }}
    </SfButton>
  </aside>
</template>

<style scoped>
.price-range input[type='range'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0;
  height: 30px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}
.price-range input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: #fff;
  border: 1.5px solid #0a0a0a;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}
.price-range input[type='range']::-moz-range-thumb {
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: #fff;
  border: 1.5px solid #0a0a0a;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}
</style>
