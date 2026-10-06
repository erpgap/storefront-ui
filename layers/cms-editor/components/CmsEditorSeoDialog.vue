<script setup lang="ts">
// Search tags for one page, in the language the editor is showing.
//
// Values are the stored ones for that language - no fallback - for the same
// reason the inspector does it: English in a Portuguese box looks translated.
// The default language's text goes in the placeholder instead.
import type { CmsPage, CmsSeo } from '#shared/cms/blocks'
import type { CmsLocale } from '#shared/cms/i18n'
import { absoluteImageUrl } from '~/utils/odooImage'

const props = defineProps<{
  pageId: string
  seo?: CmsSeo
  locale: string
  defaultLocale: string
  locales: CmsLocale[]
  /** What search results show when the meta title is empty. */
  pageTitle: string
}>()
const emit = defineEmits<{ saved: [page: CmsPage], close: [] }>()

// Search engines truncate past roughly these lengths. A guide, not a limit.
const TITLE_GUIDE = 60
const DESCRIPTION_GUIDE = 160

const title = ref(props.seo?.title?.[props.locale] ?? '')
const description = ref(props.seo?.description?.[props.locale] ?? '')
// Sent only when changed: the image is re-read and stored by Odoo on save, so
// re-sending an untouched one would copy it again for nothing.
const image = ref<string | null>(props.seo?.image ?? null)
const imageChanged = ref(false)
const pickerOpen = ref(false)
const odooImageBase = String(useRuntimeConfig().public.odooBaseImageUrl ?? '')
const imagePreview = computed(() => absoluteImageUrl(image.value, odooImageBase, ''))

function setImage(url: string | null) {
  image.value = url
  imageChanged.value = true
  pickerOpen.value = false
}

const saving = ref(false)
const error = ref('')

const isDefault = computed(() => props.locale === props.defaultLocale)
const isHomepage = computed(() => props.seo?.source === 'website')
const languageLabel = computed(() =>
  props.locales.find((option: CmsLocale) => option.code === props.locale)?.label ?? props.locale)

const sourceTitle = computed(() => props.seo?.title?.[props.defaultLocale] ?? '')
const sourceDescription = computed(() => props.seo?.description?.[props.defaultLocale] ?? '')

// Only flagged when there is something to translate from, as in the inspector.
const titleUntranslated = computed(() => !isDefault.value && !title.value && Boolean(sourceTitle.value))
const descriptionUntranslated = computed(() =>
  !isDefault.value && !description.value && Boolean(sourceDescription.value))

const titlePlaceholder = computed(() => {
  if (!isDefault.value && sourceTitle.value) return sourceTitle.value
  return isHomepage.value ? '' : `Defaults to the page title: ${props.pageTitle}`
})

async function save() {
  saving.value = true
  error.value = ''
  try {
    const page = await $fetch<CmsPage>(`/api/cms/pages/${props.pageId}/seo`, {
      method: 'PUT',
      body: {
        lang: props.locale,
        metaTitle: title.value,
        metaDescription: description.value,
        ...(imageChanged.value ? { metaImage: image.value } : {}),
      },
    })
    emit('saved', page)
  }
  catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Could not save.'
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    // The picker has its own Escape; closing both at once loses the dialog.
    if (event.key === 'Escape' && !pickerOpen.value) emit('close')
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
    role="dialog"
    aria-modal="true"
    aria-label="SEO"
    @click.self="emit('close')"
  >
    <form
      class="bg-white text-black rounded-lg w-full max-w-lg flex flex-col shadow-2xl"
      @submit.prevent="save"
    >
      <header class="flex-none flex items-center justify-between px-5 h-14 border-b border-primary-200">
        <h2 class="text-[13px] tracking-[0.14em] uppercase font-medium">
          SEO
          <span
            v-if="locales.length > 1"
            class="normal-case tracking-normal text-primary-400 font-normal"
          >· {{ languageLabel }}</span>
        </h2>
        <button
          type="button"
          class="text-primary-400 hover:text-black text-lg leading-none"
          aria-label="Close"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <div class="p-5 flex flex-col gap-4">
        <p
          v-if="isHomepage"
          class="text-[12px] text-primary-500 bg-primary-50 rounded px-3 py-2"
        >
          These are your store's homepage tags. They are the same ones as in
          the website settings in Odoo.
        </p>

        <label class="flex flex-col gap-1.5">
          <span class="flex justify-between text-[11px] tracking-[0.12em] uppercase text-primary-500">
            Meta title
            <span
              class="normal-case tracking-normal"
              :class="title.length > TITLE_GUIDE ? 'text-amber-700' : 'text-primary-400'"
            >{{ title.length }} / {{ TITLE_GUIDE }}</span>
          </span>
          <input
            v-model="title"
            type="text"
            :placeholder="titlePlaceholder"
            class="seo-input"
            :class="titleUntranslated ? 'seo-input--untranslated' : ''"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="flex justify-between text-[11px] tracking-[0.12em] uppercase text-primary-500">
            Meta description
            <span
              class="normal-case tracking-normal"
              :class="description.length > DESCRIPTION_GUIDE ? 'text-amber-700' : 'text-primary-400'"
            >{{ description.length }} / {{ DESCRIPTION_GUIDE }}</span>
          </span>
          <textarea
            v-model="description"
            rows="4"
            :placeholder="isDefault ? '' : sourceDescription"
            class="seo-input resize-y"
            :class="descriptionUntranslated ? 'seo-input--untranslated' : ''"
          />
        </label>

        <div class="flex flex-col gap-1.5">
          <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">
            Share image
          </span>
          <div class="flex items-start gap-3">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt=""
              class="w-32 aspect-[1200/630] object-cover rounded border border-primary-200 bg-primary-50"
            >
            <div
              v-else
              class="w-32 aspect-[1200/630] rounded border border-dashed border-primary-300 bg-primary-50"
            />
            <div class="flex flex-col items-start gap-1.5">
              <button
                type="button"
                class="text-[12px] underline"
                @click="pickerOpen = true"
              >
                {{ image ? 'Replace image' : 'Choose image' }}
              </button>
              <button
                v-if="image"
                type="button"
                class="text-[12px] underline text-red-600"
                @click="setImage(null)"
              >
                Remove
              </button>
            </div>
          </div>
          <span class="text-[11px] text-primary-400">
            Shown when the page is shared in social media and messaging apps.
            {{ isHomepage
              ? 'The same for every language.'
              : 'The same for every language. Without one, the first image on the page is used.' }}
          </span>
        </div>

        <p
          v-if="!isDefault"
          class="text-[11px] text-primary-400"
        >
          Left empty, {{ languageLabel }} visitors see the
          {{ locales.find((option: CmsLocale) => option.code === defaultLocale)?.label ?? defaultLocale }}
          text shown in grey.
        </p>

        <p
          v-if="error"
          class="text-[12px] text-red-600"
          role="alert"
        >
          {{ error }}
        </p>
      </div>

      <footer class="flex-none flex justify-end gap-2 px-5 py-3 border-t border-primary-200">
        <button
          type="button"
          class="px-4 py-2 text-[12px] tracking-[0.1em] uppercase border border-primary-300 rounded hover:border-black"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-[12px] tracking-[0.1em] uppercase bg-black text-white rounded disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </footer>
    </form>

    <CmsEditorMediaPicker
      v-if="pickerOpen"
      :current="image ?? undefined"
      @select="setImage"
      @close="pickerOpen = false"
    />
  </div>
</template>

<style scoped>
.seo-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  font-size: 13px;
  border: 1px solid rgb(212 212 212);
  border-radius: 4px;
}

.seo-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}

/* Same signal as the inspector's untranslated fields. */
.seo-input--untranslated {
  border-color: rgb(245 158 11);
  background: rgb(254 243 199 / 50%);
}
</style>
