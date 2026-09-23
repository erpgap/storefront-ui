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
}

definePageMeta({ layout: false, middleware: 'studio-auth' })
useHead({ title: 'Pages — Studio' })

const { data: pages, refresh } = await useFetch<PageRow[]>('/api/cms/pages', {
  key: 'studio-pages',
  default: () => [],
})

// Which store is behind this. Only used to explain what is unavailable when
// running without Odoo.
const { data: session } = await useFetch<{ backend: string }>('/api/cms/session', {
  key: 'cms-session',
})
const backend = computed(() => session.value?.backend ?? 'odoo')

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
    await navigateTo(`/studio/${page.id}`)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Could not create the page.'
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
  if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
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
    alert(e?.data?.statusMessage || 'Could not change the publish state.')
  }
}

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
            Content
          </h1>
          <p class="text-[12px] text-primary-400">
            Pages you can edit without a developer
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase text-white bg-black rounded hover:bg-blue-600 transition-colors"
          @click="startCreating"
        >
          New page
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
            <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">Page name</span>
            <input
              v-model="title"
              type="text"
              required
              placeholder="Summer Sale"
              class="studio-input"
            >
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] tracking-[0.12em] uppercase text-primary-500">Web address</span>
            <input
              v-model="slug"
              type="text"
              placeholder="/summer-sale"
              class="studio-input"
              @input="slugTouched = true"
            >
          </label>
        </div>

        <p
          v-if="error"
          class="text-[12px] text-red-600"
          role="alert"
        >
          {{ error }}
        </p>

        <div class="flex items-center gap-2">
          <button
            type="submit"
            class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase text-white bg-black rounded disabled:opacity-50"
            :disabled="busy || !title.trim()"
          >
            {{ busy ? 'Creating…' : 'Create and edit' }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-[12px] tracking-[0.08em] uppercase border border-primary-300 rounded"
            @click="creating = false"
          >
            Cancel
          </button>
        </div>
      </form>

      <!-- List -->
      <div
        v-if="!pages.length"
        class="bg-white rounded-lg border border-primary-200 p-12 text-center"
      >
        <p class="text-[13px] text-primary-500">
          No pages yet. Create one to get started.
        </p>
      </div>

      <ul
        v-else
        class="flex flex-col gap-2"
      >
        <li
          v-for="page in pages"
          :key="page.id"
          class="bg-white rounded-lg border border-primary-200 px-5 py-4 flex items-center gap-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <NuxtLink
                :to="`/studio/${page.id}`"
                class="text-[14px] font-medium hover:underline"
              >
                {{ page.title }}
              </NuxtLink>

              <span
                class="text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                :class="page.published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-primary-100 text-primary-500'"
              >
                {{ page.published ? 'Live' : 'Draft' }}
              </span>

              <span
                v-if="page.hasUnpublishedChanges"
                class="text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
              >
                Unpublished changes
              </span>
            </div>

            <p class="text-[12px] text-primary-400 mt-0.5 truncate">
              {{ page.slug }} · {{ page.blockCount }} block{{ page.blockCount === 1 ? '' : 's' }}
              · edited {{ formatDate(page.updatedAt) }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-none">
            <a
              v-if="page.published"
              :href="page.slug"
              target="_blank"
              rel="noopener"
              class="studio-btn"
            >
              View ↗
            </a>
            <button
              type="button"
              class="studio-btn"
              @click="togglePublished(page)"
            >
              {{ page.published ? 'Unpublish' : 'Publish' }}
            </button>
            <NuxtLink
              :to="`/studio/${page.id}`"
              class="studio-btn studio-btn--primary"
            >
              Edit
            </NuxtLink>
            <button
              type="button"
              class="studio-btn text-red-600"
              :aria-label="`Delete ${page.title}`"
              @click="remove(page)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>

      <p
        v-if="backend === 'file'"
        class="text-[11px] text-primary-400 mt-6 leading-relaxed"
      >
        Running on the local file store, not Odoo. Version history is
        unavailable in this mode. Unset <code>NUXT_CMS_BACKEND=file</code> to
        use Odoo.
      </p>
    </main>
  </div>
</template>

<style scoped>
.studio-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  font-size: 13px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 0.25rem;
}

.studio-input:focus-visible {
  outline: 2px solid rgb(37 99 235 / 80%);
  outline-offset: 1px;
}

.studio-btn {
  padding: 0.35rem 0.7rem;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgb(0 0 0 / 18%);
  border-radius: 0.25rem;
}

.studio-btn:hover {
  border-color: rgb(0 0 0 / 45%);
}

.studio-btn--primary {
  color: #fff;
  background: #000;
  border-color: #000;
}

.studio-btn--primary:hover {
  background: rgb(37 99 235);
  border-color: rgb(37 99 235);
}
</style>
