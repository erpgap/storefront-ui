<script setup lang="ts">
import { SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue'

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
    class="pager"
    role="navigation"
    aria-label="pagination"
    data-testid="pagination"
  >
    <!-- Previous -->
    <button
      type="button"
      class="pg"
      aria-label="Go to previous page"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      <SfIconChevronLeft size="sm" />
    </button>

    <!-- First page (when outside the window) -->
    <button
      v-if="!pagination.pages.includes(1)"
      type="button"
      class="pg"
      :class="{ 'cur': currentPage === 1 }"
      @click="goToPage(1)"
    >
      1
    </button>
    <span
      v-if="pagination.startPage > 2"
      class="pg ell"
      aria-hidden="true"
    >…</span>

    <!-- Window pages -->
    <button
      v-for="page in pagination.pages"
      :key="page"
      type="button"
      class="pg"
      :class="{ 'cur': currentPage === page }"
      :aria-current="currentPage === page || undefined"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- Last page (when outside the window) -->
    <span
      v-if="pagination.endPage < pagination.totalPages - 1"
      class="pg ell"
      aria-hidden="true"
    >…</span>
    <button
      v-if="!pagination.pages.includes(pagination.totalPages)"
      type="button"
      class="pg"
      :class="{ 'cur': currentPage === pagination.totalPages }"
      @click="goToPage(pagination.totalPages)"
    >
      {{ pagination.totalPages }}
    </button>

    <!-- Next -->
    <button
      type="button"
      class="pg"
      aria-label="Go to next page"
      :disabled="currentPage >= pagination.totalPages"
      @click="goToPage(currentPage + 1)"
    >
      <SfIconChevronRight size="sm" />
    </button>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 48px;
}
.pg {
  min-width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0 8px;
  border: 1px solid #e5e5e5;
  border-radius: 2px;
  background: #fff;
  color: #525252;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.pg:hover:not(.cur):not(:disabled) {
  border-color: #0a0a0a;
  color: #0a0a0a;
}
.pg:focus-visible {
  outline: 2px solid #0a0a0a;
  outline-offset: 2px;
}
.pg.cur {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #fff;
  cursor: default;
}
.pg:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pg.ell {
  border-color: transparent;
  color: #a3a3a3;
  background: none;
}
@media (prefers-reduced-motion: reduce) {
  .pg { transition: none; }
}
</style>
