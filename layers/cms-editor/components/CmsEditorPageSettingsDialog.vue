<script setup lang="ts">
// Page name and URL, after the page exists.
//
// Both were previously set once in the create form and then fixed forever,
// which made a typo in either permanent. The api already supported changing
// them - PATCH checks the new url is free and purges the cache for the old one
// as well as the new - so this is the editor catching up with it.
import type { CmsPage } from '#shared/cms/blocks'

const props = defineProps<{
  pageId: string
  title: string
  slug: string
  /** The homepage and friends: renameable, but their url is a storefront route. */
  isSystem?: boolean
}>()
const emit = defineEmits<{ saved: [page: CmsPage], close: [] }>()

const title = ref(props.title)
const slug = ref(props.slug)

const saving = ref(false)
const error = ref('')

// Shown under the field so the merchant sees the address they are actually
// making, not just the fragment they typed.
const origin = import.meta.client ? window.location.origin : ''
const preview = computed(() => {
  const value = slug.value.trim()
  if (!value) return ''
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`
})

const changed = computed(() =>
  title.value.trim() !== props.title || slug.value.trim() !== props.slug)

async function save() {
  if (!title.value.trim()) {
    error.value = 'A page needs a name.'
    return
  }

  saving.value = true
  error.value = ''
  try {
    const page = await $fetch<CmsPage>(`/api/cms/pages/${props.pageId}`, {
      method: 'PATCH',
      // The url is left out for system pages rather than sent unchanged: it is
      // fixed in Odoo, and sending it would fail a save that only renames.
      body: {
        title: title.value.trim(),
        ...(props.isSystem ? {} : { slug: slug.value.trim() }),
      },
    })
    emit('saved', page)
  }
  catch (e: any) {
    // The clash message names the page already using that url, which is the
    // one piece of information that makes it fixable.
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Could not save.'
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') emit('close')
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
    aria-label="Page settings"
    @click.self="emit('close')"
  >
    <form
      class="bg-white text-black rounded-lg w-full max-w-lg flex flex-col shadow-2xl"
      @submit.prevent="save"
    >
      <header class="flex-none flex items-center justify-between px-5 h-14 border-b border-primary-200">
        <h2 class="text-[13px] tracking-[0.14em] uppercase font-medium">
          Page settings
        </h2>
        <button
          type="button"
          class="text-primary-400 hover:text-black text-lg leading-none"
          aria-label="Close"
          @click="emit('close')"
        >
          &times;
        </button>
      </header>

      <div class="px-5 py-4 flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">Page name</span>
          <input
            v-model="title"
            type="text"
            required
            autofocus
            class="settings-input"
          >
          <span class="text-[11px] text-primary-400">
            What the merchant sees in the page list. Not shown to shoppers.
          </span>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">Page URL</span>
          <input
            v-model="slug"
            type="text"
            :disabled="isSystem"
            placeholder="/summer-sale"
            class="settings-input"
          >
          <span
            v-if="isSystem"
            class="text-[11px] text-primary-400"
          >
            This page is part of the storefront, so its address is fixed.
          </span>
          <span
            v-else-if="preview"
            class="text-[11px] text-primary-400 break-all"
          >
            {{ preview }}
          </span>
        </label>

        <p
          v-if="!isSystem"
          class="text-[11px] text-primary-400 leading-snug"
        >
          Changing the address breaks existing links to this page.
        </p>

        <p
          v-if="error"
          class="text-[12px] text-red-600"
          role="alert"
        >
          {{ error }}
        </p>
      </div>

      <footer class="flex-none flex items-center justify-end gap-2 px-5 h-14 border-t border-primary-200">
        <button
          type="button"
          class="text-[13px] text-primary-500 hover:text-black px-3 py-1.5"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="text-[13px] bg-black text-white rounded px-3 py-1.5 disabled:opacity-40"
          :disabled="saving || !changed"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
.settings-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  font-size: 13px;
  border: 1px solid rgb(212 212 212);
  border-radius: 4px;
}

.settings-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}

.settings-input:disabled {
  background: rgb(245 245 245);
  color: rgb(115 115 115);
}
</style>
