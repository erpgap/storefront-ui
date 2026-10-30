<script setup lang="ts">
// The page list — the merchant's home base, and the surface Odoo's generic
// admin would have given us for free if the editor lived in Odoo. Building it
// ourselves is the cost we accepted in §3 in exchange for a canvas that can
// render Vue + Tailwind + StorefrontUI.
interface PageRow {
  id: string
  title: string
  slug: string
  published: boolean
  blockCount: number
  hasUnpublishedChanges: boolean
  updatedAt: string
  publishedAt?: string
  kind?: 'page' | 'region'
  regionKey?: string
  isSystem?: boolean
}

definePageMeta({ layout: false, middleware: 'cms-auth' })
const { t } = useI18n()
const cmsText = useCmsText()
useHead({ title: () => t('cmsEditor.pages.pageTitle') })

const { data: pages, refresh, error: listError } = await useFetch<PageRow[]>(
  '/api/cms/pages',
  { key: 'cms-editor-pages', default: () => [] },
)

// --- create -----------------------------------------------------------------

const creating = ref(false)
const title = ref('')
const slug = ref('')
const slugTouched = ref(false)
const error = ref('')
const busy = ref(false)

// Slug follows the title until the merchant edits it themselves — the usual
// CMS behaviour, and it means most people never think about URLs at all.
watch(title, (value) => {
  if (slugTouched.value) return
  slug.value = `/${value.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
})

async function create() {
  error.value = ''
  busy.value = true

  try {
    const page = await $fetch<{ id: string }>('/api/cms/pages', {
      method: 'POST',
      body: { title: title.value, slug: slug.value },
    })
    await navigateTo(`/cms/${page.id}`)
  }
  catch (e: any) {
    error.value = cmsText.errorMessage(e, t('cmsEditor.pages.createFailed'))
  }
  finally {
    busy.value = false
  }
}

function startCreating() {
  creating.value = true
  title.value = ''
  slug.value = ''
  slugTouched.value = false
  error.value = ''
}

// --- row actions ------------------------------------------------------------

async function remove(page: PageRow) {
  if (!confirm(t('cmsEditor.pages.confirmDelete', { title: page.title }))) return
  await $fetch(`/api/cms/pages/${page.id}`, { method: 'DELETE' })
  await refresh()
}

async function togglePublished(page: PageRow) {
  const action = page.published ? 'unpublish' : 'publish'
  try {
    await $fetch(`/api/cms/pages/${page.id}/${action}`, { method: 'POST' })
    await refresh()
  }
  catch (e: any) {
    alert(cmsText.errorMessage(e, t('cmsEditor.pages.publishStateFailed')))
  }
}

/**
 * Regions are listed apart from pages because they are a different kind of
 * thing: a page is somewhere a visitor goes, a region is content that appears
 * inside pages the storefront owns. Mixing them in one list invites the
 * question "what is the address of 'Below product pages'?", which has no
 * answer.
 */
const realPages = computed(() => pages.value.filter(p => p.kind !== 'region'))
const regions = computed(() => pages.value.filter(p => p.kind === 'region'))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <div class="min-h-screen bg-primary-50 text-black">
    <header class="bg-white border-b border-primary-200">
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <h1 class="text-[15px] font-medium">
            {{ $t('cmsEditor.brand') }}
          </h1>
          <p class="text-[12px] text-primary-400">
            {{ $t('cmsEditor.tagline') }}
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase text-white bg-black rounded-sm hover:bg-blue-600 transition-colors"
          @click="startCreating"
        >
          {{ $t('cmsEditor.pages.newPage') }}
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <!-- Create form -->
      <form
        v-if="creating"
        class="bg-white rounded-lg border border-primary-200 p-5 mb-6 flex flex-col gap-4"
        @submit.prevent="create"
      >
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">{{ $t('cmsEditor.pages.pageName') }}</span>
            <input
              v-model="title"
              type="text"
              required
              :placeholder="$t('cmsEditor.pages.pageNamePlaceholder')"
              class="editor-input"
            >
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">{{ $t('cmsEditor.pages.pageUrl') }}</span>
            <input
              v-model="slug"
              type="text"
              :placeholder="$t('cmsEditor.pages.pageUrlPlaceholder')"
              class="editor-input"
              @input="slugTouched = true"
            >
          </label>
        </div>

        <CmsEditorError v-if="error">
          {{ error }}
        </CmsEditorError>

        <div class="flex items-center gap-2">
          <button
            type="submit"
            class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase text-white bg-black rounded-sm disabled:opacity-50"
            :disabled="busy || !title.trim()"
          >
            {{ busy ? $t('cmsEditor.pages.creating') : $t('cmsEditor.pages.createAndEdit') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase border border-primary-300 rounded-sm"
            @click="creating = false"
          >
            {{ $t('cmsEditor.cancel') }}
          </button>
        </div>
      </form>

      <!-- List -->
      <!-- A failed load and an empty list look identical otherwise, and
           "No pages yet" is a lie that sends people looking in the wrong
           place. -->
      <div
        v-if="listError"
        class="bg-white rounded-lg border border-red-200 p-12 text-center"
      >
        <p class="text-[13px] text-red-700">
          {{ $t('cmsEditor.pages.loadFailed') }}
        </p>
        <p class="text-[12px] text-primary-500 mt-1">
          {{ $t('cmsEditor.pages.loadFailedHint') }}
        </p>
        <button
          type="button"
          class="editor-btn mt-4"
          @click="refresh()"
        >
          {{ $t('cmsEditor.pages.tryAgain') }}
        </button>
      </div>

      <div
        v-else-if="!realPages.length"
        class="bg-white rounded-lg border border-primary-200 p-12 text-center"
      >
        <p class="text-[13px] text-primary-500">
          {{ $t('cmsEditor.pages.empty') }}
        </p>
      </div>

      <ul
        v-else
        class="flex flex-col gap-2"
      >
        <li
          v-for="page in realPages"
          :key="page.id"
          class="bg-white rounded-lg border border-primary-200 px-5 py-4 flex items-center gap-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <NuxtLink
                :to="`/cms/${page.id}`"
                class="text-[14px] font-medium hover:underline"
              >
                {{ page.title }}
              </NuxtLink>

              <span
                class="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
                :class="page.published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-primary-100 text-primary-500'"
              >
                {{ page.published ? $t('cmsEditor.pages.live') : $t('cmsEditor.pages.draft') }}
              </span>

              <span
                v-if="page.hasUnpublishedChanges"
                class="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800"
              >
                {{ $t('cmsEditor.pages.unpublishedChanges') }}
              </span>
            </div>

            <p class="text-[12px] text-primary-400 mt-0.5 truncate">
              {{ page.slug }} · {{ $t('cmsEditor.pages.blockCount', page.blockCount) }}
              · {{ $t('cmsEditor.pages.edited', { date: formatDate(page.updatedAt) }) }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-none">
            <a
              v-if="page.published"
              :href="page.slug"
              target="_blank"
              rel="noopener"
              class="editor-btn"
            >
              {{ $t('cmsEditor.pages.view') }}
            </a>
            <!-- A built-in page always stays live; Odoo refuses it anyway. -->
            <button
              v-if="!(page.isSystem && page.published)"
              type="button"
              class="editor-btn"
              @click="togglePublished(page)"
            >
              {{ page.published ? $t('cmsEditor.pages.unpublish') : $t('cmsEditor.pages.publish') }}
            </button>
            <NuxtLink
              :to="`/cms/${page.id}`"
              class="editor-btn editor-btn--primary"
            >
              {{ $t('cmsEditor.pages.edit') }}
            </NuxtLink>
            <button
              v-if="!page.isSystem"
              type="button"
              class="editor-btn editor-btn--danger"
              :aria-label="$t('cmsEditor.pages.deleteNamed', { title: page.title })"
              @click="remove(page)"
            >
              {{ $t('cmsEditor.pages.delete') }}
            </button>
          </div>
        </li>
      </ul>

      <section
        v-if="regions.length"
        class="mt-10"
      >
        <h2 class="text-[13px] font-medium">
          {{ $t('cmsEditor.pages.regionsHeading') }}
        </h2>
        <p class="text-[12px] text-primary-400 mb-3">
          {{ $t('cmsEditor.pages.regionsHint') }}
        </p>

        <ul class="flex flex-col gap-2">
          <li
            v-for="region in regions"
            :key="region.id"
            class="bg-white rounded-lg border border-primary-200 px-5 py-4 flex items-center gap-4"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <NuxtLink
                  :to="`/cms/${region.id}`"
                  class="text-[14px] font-medium hover:underline"
                >
                  {{ region.title }}
                </NuxtLink>
                <span
                  v-if="region.hasUnpublishedChanges"
                  class="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800"
                >{{ $t('cmsEditor.pages.unpublishedChanges') }}</span>
                <span
                  v-else-if="!region.blockCount"
                  class="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-primary-100 text-primary-500"
                >{{ $t('cmsEditor.pages.regionEmpty') }}</span>
              </div>
              <p class="text-[12px] text-primary-400 mt-0.5 truncate">
                {{ $t('cmsEditor.pages.blockCount', region.blockCount) }}
                · {{ $t('cmsEditor.pages.edited', { date: formatDate(region.updatedAt) }) }}
              </p>
            </div>

            <NuxtLink
              :to="`/cms/${region.id}`"
              class="editor-btn editor-btn--primary flex-none"
            >
              {{ $t('cmsEditor.pages.edit') }}
            </NuxtLink>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
.editor-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  font-size: 13px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 0.25rem;
}

.editor-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}

.editor-btn {
  padding: 0.35rem 0.7rem;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgb(0 0 0 / 18%);
  border-radius: 0.25rem;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}

/* A visible fill on hover, not just a darker outline - a border going from
   18% to 45% black is close to invisible against a white row. */
.editor-btn:hover:not(:disabled) {
  background: rgb(0 0 0 / 5%);
  border-color: rgb(0 0 0 / 55%);
}

.editor-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.editor-btn--primary {
  color: #fff;
  background: #000;
  border-color: #000;
}

/* Lifts to charcoal rather than turning blue. The blue read as a different
   button appearing under the cursor rather than the same one responding. */
.editor-btn--primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

/* Destructive actions carry their colour in the border too, so the risk is
   legible before the pointer reaches them. */
.editor-btn--danger {
  color: rgb(220 38 38);
  border-color: rgb(220 38 38 / 45%);
}

.editor-btn--danger:hover:not(:disabled) {
  color: rgb(185 28 28);
  background: rgb(254 242 242);
  border-color: rgb(220 38 38);
}

@media (prefers-reduced-motion: reduce) {
  .editor-btn {
    transition: none;
  }
}
</style>
