<script setup lang="ts">
// THE FIELD REGISTRY — one widget per field type, written once.
//
// This is the leverage point of the whole design (§5.4). After this component
// exists, adding a new block costs a Vue component plus a schema entry and ZERO
// editor code. Getting it wrong means hand-writing an inspector per block
// forever, which is how in-house CMS projects quietly become unmaintainable.
//
// Note what is NOT here: no colour picker, no font control, no spacing, no
// alignment beyond what a block explicitly offers. Block fields describe
// content, never presentation (§2). The design system stays enforced in code,
// so a merchant cannot break the storefront's look.
import type { ArrayField, Field, SelectField } from '#shared/cms/blocks'
import { defaultsFor, isTranslatable } from '#shared/cms/blocks'
import { DEFAULT_LOCALE, localeLabel, resolveValue, setValue, toMap } from '#shared/cms/i18n'

const props = withDefaults(defineProps<{
  field: Field
  modelValue: unknown
  /** Validation messages from the server, keyed by field path. */
  issues?: Record<string, string>
  path?: string
  /** The language being edited. */
  locale?: string
}>(), { locale: DEFAULT_LOCALE })

const emit = defineEmits<{ 'update:modelValue': [unknown] }>()

const label = computed(() => props.field.label ?? props.field.name)
const fieldPath = computed(() => props.path ?? props.field.name)
const issue = computed(() => props.issues?.[fieldPath.value])

// --- scalar bindings --------------------------------------------------------

const translatable = computed(() => isTranslatable(props.field))
const isDefaultLocale = computed(() => props.locale === DEFAULT_LOCALE)

/**
 * The merchant edits a plain string. The per-language map is assembled here and
 * never surfaces in the UI — this is the entire reason the storage shape stays
 * invisible to them.
 *
 * Reading does NOT fall back to the default language: showing English text in a
 * Portuguese box would make untranslated fields look finished, and the merchant
 * would have to delete it before typing. The English text goes in the
 * placeholder instead, where it helps as a reference without pretending to be
 * a translation.
 */
const text = computed({
  get: () => {
    if (!translatable.value) {
      return typeof props.modelValue === 'string' ? props.modelValue : ''
    }
    return toMap(props.modelValue)[props.locale] ?? ''
  },
  set: (value) => {
    emit('update:modelValue', translatable.value
      ? setValue(props.modelValue, props.locale, value)
      : value)
  },
})

/** The default-language text, shown as a placeholder while translating. */
const sourceText = computed(() =>
  translatable.value && !isDefaultLocale.value
    ? resolveValue(props.modelValue, DEFAULT_LOCALE)
    : '')

/**
 * What the page will actually render for this field in this language — the
 * translation if there is one, otherwise the default language's value.
 *
 * Images use this rather than the raw per-language value. An untranslated
 * IMAGE is not missing, it is inherited, and showing an empty "Choose an image"
 * box while the page visibly renders a photo is just a lie about the state.
 */
const effectiveValue = computed(() => resolveValue(props.modelValue, props.locale))
const inherited = computed(() => !isDefaultLocale.value && !text.value && Boolean(effectiveValue.value))

// Mirrors `untranslatedFields` in shared/cms/blocks.ts: only prose is flagged.
// An inherited link or image is the normal, correct outcome, not a gap.
const needsTranslation = computed(() =>
  (props.field.type === 'text' || props.field.type === 'textarea')
  && Boolean(sourceText.value.trim())
  && !text.value.trim())

const numberValue = computed({
  get: () => (typeof props.modelValue === 'number' ? props.modelValue : 0),
  set: value => emit('update:modelValue', Number(value)),
})

const boolValue = computed({
  get: () => Boolean(props.modelValue),
  set: value => emit('update:modelValue', value),
})

const selectField = computed(() => props.field as SelectField)

// --- image ------------------------------------------------------------------

const pickerOpen = ref(false)

function chooseImage(url: string) {
  emit('update:modelValue', translatable.value
    ? setValue(props.modelValue, props.locale, url)
    : url)
  pickerOpen.value = false
}

// --- array (repeater) -------------------------------------------------------

const arrayField = computed(() => props.field as ArrayField)

const rows = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue as Record<string, unknown>[] : [])

/**
 * Rows are SHARED across languages — one list, translated content. Adding a
 * button while editing Portuguese would create a button that exists in one
 * language and not others, which is a layout difference masquerading as a
 * translation. Structure is edited in the default language; other languages
 * translate what is there.
 */
const canEditStructure = computed(() => isDefaultLocale.value)

const canAdd = computed(() => {
  if (!canEditStructure.value) return false
  const max = arrayField.value.max
  return max === undefined || rows.value.length < max
})

const canRemove = computed(() =>
  canEditStructure.value && rows.value.length > (arrayField.value.min ?? 0))

// Rows are reordered by buttons, not drag. Inside a narrow inspector panel,
// buttons are faster, work on touch, and are keyboard-accessible for free —
// drag-and-drop belongs on the canvas where the spatial metaphor earns its cost.
function moveRow(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= rows.value.length) return
  const next = [...rows.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved!)
  emit('update:modelValue', next)
}

function updateRow(index: number, name: string, value: unknown) {
  emit('update:modelValue', rows.value.map((row, i) =>
    i === index ? { ...row, [name]: value } : row))
}

function addRow() {
  emit('update:modelValue', [...rows.value, defaultsFor(arrayField.value.fields)])
}

function removeRow(index: number) {
  emit('update:modelValue', rows.value.filter((_, i) => i !== index))
}

function rowTitle(row: Record<string, unknown>, index: number) {
  const key = arrayField.value.titleField
  const field = arrayField.value.fields.find(f => f.name === key)
  const raw = key ? row[key] : undefined
  const value = field && isTranslatable(field) ? resolveValue(raw, props.locale) : raw

  return (typeof value === 'string' && value.trim()) || `Item ${index + 1}`
}

// The row's own image, used as a thumbnail in the repeater header so a list of
// four categories does not read as four identical grey boxes.
function rowThumb(row: Record<string, unknown>) {
  const imageField = arrayField.value.fields.find(f => f.type === 'image')
  const value = imageField ? resolveValue(row[imageField.name], props.locale) : ''
  return value || null
}
</script>

<template>
  <!--
    While translating, fields with no language-specific content are hidden
    rather than shown disabled. "Show 4 products" and "image on the left" are
    single decisions, not one per language, and a column of greyed-out controls
    is noise. The inspector header says so once.

    An ARRAY is never hidden: the repeater itself is structural, but its rows
    contain translatable text — button labels being the obvious case.
  -->
  <div
    v-if="isDefaultLocale || translatable || field.type === 'array'"
    class="flex flex-col gap-1.5"
  >
    <label
      v-if="field.type !== 'boolean'"
      class="text-[11px] tracking-[0.12em] uppercase text-primary-500"
      :for="`f-${fieldPath}`"
    >
      {{ label }}<span
        v-if="field.required"
        class="text-red-500"
        aria-hidden="true"
      > *</span>
      <span
        v-if="needsTranslation"
        class="ml-1.5 normal-case tracking-normal text-amber-600"
      >· not translated</span>
    </label>

    <!-- textarea -->
    <textarea
      v-if="field.type === 'textarea'"
      :id="`f-${fieldPath}`"
      v-model="text"
      rows="4"
      :placeholder="sourceText"
      class="studio-input resize-y"
      :class="needsTranslation ? 'studio-input--untranslated' : ''"
    />

    <!-- select -->
    <select
      v-else-if="field.type === 'select'"
      :id="`f-${fieldPath}`"
      v-model="text"
      class="studio-input"
    >
      <option
        v-for="option in selectField.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- number -->
    <input
      v-else-if="field.type === 'number'"
      :id="`f-${fieldPath}`"
      v-model.number="numberValue"
      type="number"
      :min="(field as any).min"
      :max="(field as any).max"
      class="studio-input"
    >

    <!-- boolean -->
    <label
      v-else-if="field.type === 'boolean'"
      class="flex items-center gap-2 text-[13px] cursor-pointer"
    >
      <input
        v-model="boolValue"
        type="checkbox"
        class="w-4 h-4"
      >
      {{ label }}
    </label>

    <!-- image: a thumbnail that opens the media library. The merchant never
         sees or types a path. -->
    <div v-else-if="field.type === 'image'">
      <button
        type="button"
        class="w-full rounded-md border border-primary-200 overflow-hidden text-left hover:border-primary-400 transition-colors"
        @click="pickerOpen = true"
      >
        <img
          v-if="effectiveValue"
          :src="effectiveValue"
          alt=""
          class="w-full aspect-[16/9] object-cover bg-primary-100"
          :class="inherited ? 'opacity-70' : ''"
        >
        <span
          v-else
          class="flex items-center justify-center aspect-[16/9] bg-primary-50 text-[12px] text-primary-400"
        >
          Choose an image
        </span>
        <span class="block px-2.5 py-2 text-[11px] text-primary-500">
          {{ inherited
            ? `Using the ${localeLabel(DEFAULT_LOCALE)} image · tap to use a different one here`
            : effectiveValue ? 'Replace image' : 'Upload or pick an image' }}
        </span>
      </button>

      <StudioMediaPicker
        v-if="pickerOpen"
        :current="effectiveValue"
        @select="chooseImage"
        @close="pickerOpen = false"
      />
    </div>

    <!-- text / link -->
    <input
      v-else-if="field.type === 'text' || field.type === 'link'"
      :id="`f-${fieldPath}`"
      v-model="text"
      type="text"
      :placeholder="sourceText || (field.type === 'link' ? '/products' : undefined)"
      class="studio-input"
      :class="needsTranslation ? 'studio-input--untranslated' : ''"
    >

    <!-- array: recurses into this same component for every sub-field. -->
    <div
      v-else-if="field.type === 'array'"
      class="flex flex-col gap-2"
    >
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="rounded-md border border-primary-200 overflow-hidden"
      >
        <div class="flex items-center gap-2 px-2 py-1.5 bg-primary-50">
          <img
            v-if="rowThumb(row)"
            :src="rowThumb(row)!"
            alt=""
            class="w-7 h-7 rounded object-cover flex-none"
          >
          <span class="text-[12px] font-medium truncate flex-1">{{ rowTitle(row, index) }}</span>
          <span
            v-if="canEditStructure"
            class="flex items-center gap-0.5 text-primary-400 flex-none"
          >
            <button
              type="button"
              class="studio-icon-btn"
              :disabled="index === 0"
              :aria-label="`Move ${rowTitle(row, index)} up`"
              @click="moveRow(index, -1)"
            >↑</button>
            <button
              type="button"
              class="studio-icon-btn"
              :disabled="index === rows.length - 1"
              :aria-label="`Move ${rowTitle(row, index)} down`"
              @click="moveRow(index, 1)"
            >↓</button>
            <button
              type="button"
              class="studio-icon-btn"
              :disabled="!canRemove"
              :aria-label="`Remove ${rowTitle(row, index)}`"
              @click="removeRow(index)"
            >✕</button>
          </span>
        </div>

        <div class="p-2.5 flex flex-col gap-2.5">
          <StudioFieldControl
            v-for="sub in arrayField.fields"
            :key="sub.name"
            :field="sub"
            :model-value="row[sub.name]"
            :issues="issues"
            :locale="locale"
            :path="`${fieldPath}[${index}].${sub.name}`"
            @update:model-value="value => updateRow(index, sub.name, value)"
          />
        </div>
      </div>

      <button
        v-if="canAdd"
        type="button"
        class="text-[12px] tracking-[0.08em] uppercase text-primary-600 hover:text-black self-start"
        @click="addRow"
      >
        + {{ arrayField.addLabel ?? `Add ${label}` }}
      </button>
    </div>

    <p
      v-if="issue"
      class="text-[11px] text-red-600 leading-snug"
      role="alert"
    >
      {{ issue }}
    </p>
    <p
      v-else-if="field.help"
      class="text-[11px] text-primary-400 leading-snug"
    >
      {{ field.help }}
    </p>
  </div>
</template>

<style scoped>
.studio-input {
  width: 100%;
  padding: 0.4rem 0.55rem;
  font-size: 13px;
  color: inherit;
  background: #fff;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 0.25rem;
}

.studio-input--untranslated {
  border-color: rgb(217 119 6 / 55%);
  background: rgb(254 252 232 / 60%);
}

.studio-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}

.studio-icon-btn {
  padding: 0 0.2rem;
  font-size: 12px;
  line-height: 1;
}

.studio-icon-btn:hover:not(:disabled) {
  color: #000;
}

.studio-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
