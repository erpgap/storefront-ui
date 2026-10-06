<script setup lang="ts">
// Version history.
//
// Restoring copies the chosen version FORWARD into a new one and makes that
// live, rather than moving a pointer backwards. History stays append-only, so
// "what was live last Tuesday?" always has an answer.
interface Revision {
  id: number
  number: number
  author?: string
  createdAt?: string
  restoredFrom?: number
  isLive: boolean
}

const props = defineProps<{
  pageId: string
  hasUnpublishedChanges: boolean
}>()

const emit = defineEmits<{ restored: [], close: [] }>()

const { data: revisions, pending } = await useFetch<Revision[]>(
  `/api/cms/pages/${props.pageId}/revisions`,
  { key: `cms-revisions-${props.pageId}`, default: () => [] },
)

const busy = ref<number | null>(null)
const error = ref('')

async function restore(revision: Revision) {
  // The draft usually holds what is being rolled back FROM, so resetting it is
  // almost always right - but never at the cost of silently binning work in
  // progress.
  const warning = props.hasUnpublishedChanges
    ? 'You have unpublished changes that will be replaced. '
    : ''

  if (!confirm(`${warning}Make version ${revision.number} live again?`)) return

  busy.value = revision.id
  error.value = ''

  try {
    await $fetch(`/api/cms/pages/${props.pageId}/restore`, {
      method: 'POST',
      body: { revisionId: revision.id },
    })
    emit('restored')
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not restore that version.'
  }
  finally {
    busy.value = null
  }
}

function when(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-20"
    role="dialog"
    aria-modal="true"
    aria-label="Version history"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-lg w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl">
      <header class="flex-none flex items-center justify-between px-5 h-14 border-b border-primary-200">
        <h2 class="text-[13px] tracking-[0.14em] uppercase font-medium">
          Version history
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

      <div class="flex-1 overflow-y-auto">
        <p
          v-if="pending && !revisions.length"
          class="p-5 text-[13px] text-primary-400"
        >
          Loading…
        </p>
        <p
          v-else-if="!revisions.length"
          class="p-5 text-[13px] text-primary-400"
        >
          This page has not been published yet, so there are no versions.
        </p>

        <ul v-else>
          <li
            v-for="revision in revisions"
            :key="revision.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-primary-100 last:border-0"
          >
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-medium flex items-center gap-2">
                Version {{ revision.number }}
                <span
                  v-if="revision.isLive"
                  class="text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-800"
                >Live</span>
                <span
                  v-if="revision.restoredFrom"
                  class="text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded bg-primary-100 text-primary-600"
                >From {{ revision.restoredFrom }}</span>
              </p>
              <p class="text-[11px] text-primary-400 truncate">
                {{ when(revision.createdAt) }}
                <template v-if="revision.author">
                  · {{ revision.author }}
                </template>
              </p>
            </div>

            <button
              v-if="!revision.isLive"
              type="button"
              class="flex-none px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase border border-primary-300 rounded hover:border-black disabled:opacity-40"
              :disabled="busy !== null"
              @click="restore(revision)"
            >
              {{ busy === revision.id ? 'Restoring…' : 'Restore' }}
            </button>
          </li>
        </ul>

        <p
          v-if="error"
          class="px-5 py-3 text-[12px] text-red-600"
          role="alert"
        >
          {{ error }}
        </p>
      </div>

      <footer class="flex-none px-5 py-3 border-t border-primary-200">
        <p class="text-[11px] text-primary-400 leading-snug">
          Restoring makes that version live again and resets the editor to
          match. It is kept as a new version, so nothing is lost.
        </p>
      </footer>
    </div>
  </div>
</template>
