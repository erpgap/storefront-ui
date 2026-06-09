<script setup lang="ts">
import { SfButton, SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue'

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  currentPage: number
  pageSize: number
  totalItems: number
  maxVisiblePages: number
}>()

// -------------------------------------------------------------------
// Derived pagination window
// -------------------------------------------------------------------

const pagination = computed(() => {
  const totalPages = Math.max(1, Math.ceil(props.totalItems / Math.max(1, props.pageSize)))
  const maxPages = Math.max(1, props.maxVisiblePages)
  const current = Math.min(Math.max(1, props.currentPage), totalPages)

  const half = Math.floor(maxPages / 2)
  let startPage = Math.max(1, current - half)
  const endPage = Math.min(totalPages, startPage + maxPages - 1)
  startPage = Math.max(1, endPage - maxPages + 1)

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return { totalPages, startPage, endPage, pages }
})

// -------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------

const goToPage = (page: number) => {
  router.push({ query: { ...route.query, page } })
}
</script>

<template>
  <nav
    class="flex justify-between items-end border-t border-neutral-200"
    role="navigation"
    aria-label="pagination"
    data-testid="pagination"
  >
    <!-- Previous -->
    <SfButton
      type="button"
      size="lg"
      aria-label="Go to previous page"
      :disabled="currentPage <= 1"
      variant="tertiary"
      class="gap-3"
      @click="goToPage(currentPage - 1)"
    >
      <template #prefix>
        <SfIconChevronLeft />
      </template>
      <span class="hidden sm:inline-flex">Previous</span>
    </SfButton>

    <!-- Page numbers -->
    <ul class="flex justify-center">
      <!-- First page (when not in window) -->
      <li v-if="!pagination.pages.includes(1)">
        <div
          class="flex pt-1 border-t-4"
          :class="currentPage === 1 ? 'font-medium !border-primary-500' : 'border-transparent'"
        >
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="currentPage === 1 || undefined"
            @click="goToPage(1)"
          >
            1
          </button>
        </div>
      </li>

      <!-- Left ellipsis -->
      <li v-if="pagination.startPage > 2" aria-hidden="true">
        <div class="flex pt-1 border-t-4 border-transparent">
          <span class="px-4 py-3 md:w-12 rounded-md text-neutral-500">...</span>
        </div>
      </li>

      <!-- Second-to-last page on mobile (when on last page with 1 visible) -->
      <li v-if="maxVisiblePages === 1 && currentPage === pagination.totalPages">
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            @click="goToPage(pagination.totalPages - 1)"
          >
            {{ pagination.totalPages - 1 }}
          </button>
        </div>
      </li>

      <!-- Window pages -->
      <li
        v-for="page in pagination.pages"
        :key="page"
      >
        <div
          class="flex pt-1 border-t-4"
          :class="currentPage === page ? 'font-medium !border-primary-700' : 'border-transparent'"
        >
          <button
            type="button"
            class="px-4 py-3 md:w-12 text-neutral-500 rounded-md hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :class="{ '!text-neutral-900': currentPage === page }"
            :aria-current="currentPage === page || undefined"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </li>

      <!-- Second page on mobile (when on first page with 1 visible) -->
      <li v-if="maxVisiblePages === 1 && currentPage === 1">
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            aria-label="Second page"
            @click="goToPage(2)"
          >
            2
          </button>
        </div>
      </li>

      <!-- Right ellipsis -->
      <li v-if="pagination.endPage < pagination.totalPages - 1" aria-hidden="true">
        <div class="flex pt-1 border-t-4 border-transparent">
          <span class="px-4 py-3 md:w-12 rounded-md text-neutral-500">...</span>
        </div>
      </li>

      <!-- Last page (when not in window) -->
      <li v-if="!pagination.pages.includes(pagination.totalPages)">
        <div
          class="flex pt-1 border-t-4"
          :class="currentPage === pagination.totalPages ? 'font-medium !border-primary-500' : 'border-transparent'"
        >
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="currentPage === pagination.totalPages || undefined"
            @click="goToPage(pagination.totalPages)"
          >
            {{ pagination.totalPages }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Next -->
    <SfButton
      type="button"
      size="lg"
      aria-label="Go to next page"
      :disabled="currentPage >= pagination.totalPages"
      variant="tertiary"
      class="gap-3"
      @click="goToPage(currentPage + 1)"
    >
      <span class="hidden sm:inline-flex">Next</span>
      <template #suffix>
        <SfIconChevronRight />
      </template>
    </SfButton>
  </nav>
</template>
