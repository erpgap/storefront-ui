<script setup lang="ts">
// The media library. Opened from any `image` field — the merchant never types
// a path.
//
// It is one component for both halves of the job (pick an existing image,
// upload a new one) because to a merchant those are the same action: "put a
// picture here."
interface MediaItem {
  url: string
  name: string
  size: number
  uploadedAt: string
  uploaded: boolean
}

const props = defineProps<{ current?: string }>()
const emit = defineEmits<{ select: [url: string], close: [] }>()

const { data: items, refresh, pending } = await useFetch<MediaItem[]>('/api/cms/media', {
  key: 'studio-media',
  default: () => [],
})

const uploading = ref(false)
const error = ref('')
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function upload(files: FileList | File[] | null) {
  const list = Array.from(files ?? [])
  if (!list.length) return

  uploading.value = true
  error.value = ''

  try {
    let lastUrl = ''

    for (const file of list) {
      const body = new FormData()
      body.append('file', file)
      const result = await $fetch<{ url: string }>('/api/cms/media', { method: 'POST', body })
      lastUrl = result.url
    }

    await refresh()
    // Uploading is almost always "I want THIS image here", so pick it straight
    // away rather than making them find it in the grid.
    if (lastUrl) emit('select', lastUrl)
  }
  catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Upload failed.'
  }
  finally {
    uploading.value = false
  }
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  void upload(event.dataTransfer?.files ?? null)
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}

// Escape closes, which is what every other modal on the planet does.
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
    aria-label="Choose an image"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
      <header class="flex-none flex items-center justify-between px-5 h-14 border-b border-primary-200">
        <h2 class="text-[13px] tracking-[0.14em] uppercase font-medium">
          Choose an image
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

      <div class="flex-1 overflow-y-auto p-5">
        <!-- Upload dropzone -->
        <div
          class="rounded-lg border-2 border-dashed p-6 text-center transition-colors mb-5"
          :class="dragOver ? 'border-blue-500 bg-blue-50' : 'border-primary-200'"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="onDrop"
        >
          <p class="text-[13px] text-primary-500">
            Drag an image here, or
            <button
              type="button"
              class="underline text-black"
              @click="fileInput?.click()"
            >
              choose a file
            </button>
          </p>
          <p class="text-[11px] text-primary-400 mt-1.5">
            JPG, PNG, WebP, AVIF or GIF · up to 8 MB
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            class="hidden"
            @change="upload(($event.target as HTMLInputElement).files)"
          >
          <p
            v-if="uploading"
            class="text-[12px] text-blue-600 mt-2"
          >
            Uploading…
          </p>
          <p
            v-if="error"
            class="text-[12px] text-red-600 mt-2"
            role="alert"
          >
            {{ error }}
          </p>
        </div>

        <p
          v-if="pending && !items.length"
          class="text-[13px] text-primary-400"
        >
          Loading…
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            v-for="item in items"
            :key="item.url"
            type="button"
            class="group text-left rounded-md overflow-hidden border-2 transition-colors"
            :class="item.url === props.current
              ? 'border-blue-500'
              : 'border-transparent hover:border-primary-300'"
            @click="emit('select', item.url)"
          >
            <img
              :src="item.url"
              :alt="item.name"
              loading="lazy"
              class="w-full aspect-[4/3] object-cover bg-primary-100"
            >
            <span class="block px-2 py-1.5">
              <span class="block text-[11px] truncate">{{ item.name }}</span>
              <span class="block text-[10px] text-primary-400">{{ formatSize(item.size) }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
