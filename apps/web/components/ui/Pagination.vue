<script setup lang="ts">
import {
  SfButton,
  SfIconChevronLeft,
  SfIconChevronRight,
  usePagination,
} from '@storefront-ui/vue';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  maxVisiblePages: {
    type: Number,
    required: true,
  },
});

const pagination = computed<any>(() => reactive(
  usePagination({
    totalItems: props?.totalItems,
    currentPage: props?.currentPage,
    pageSize: props?.pageSize,
    maxPages: props?.maxVisiblePages,
  })
));

const setParams = (filter: any) => {
  router.push({ query: { ...route.query, ...filter } });
};

onMounted(() => {
  pagination.value?.setPage(route.query.page ? Number(route.query.page) : 1);
});
</script>

<template>
  <nav
    class="flex justify-between items-end border-t border-neutral-200"
    role="navigation"
    aria-label="pagination"
    data-testid="pagination"
  >
    <SfButton
      type="button"
      size="lg"
      aria-label="Go to previous page"
      :disabled="pagination.selectedPage <= 1"
      variant="tertiary"
      class="gap-3"
      @click="
        pagination.prev();
        setParams({ ['page']: pagination.selectedPage });
      "
    >
      <template #prefix>
        <SfIconChevronLeft />
      </template>
      <span class="hidden sm:inline-flex">Previous</span>
    </SfButton>
    <ul class="flex justify-center">
      <li v-if="!pagination.pages.includes(1)">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            {
              'font-medium border-t-4 !border-primary-500':
                pagination.selectedPage === 1,
            },
          ]"
        >
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.selectedPage === 1"
            @click="
              pagination.setPage(1);
              setParams({ ['page']: 1 });
            "
          >
            1
          </button>
        </div>
      </li>
      <li v-if="pagination.startPage > 2">
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            disabled
            aria-hidden="true"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500"
          >
            ...
          </button>
        </div>
      </li>
      <li
        v-if="
          maxVisiblePages === 1 &&
          pagination.selectedPage === pagination.totalPages
        "
      >
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.endPage - 1 === pagination.selectedPage"
            @click="
              pagination.setPage(pagination.endPage - 1);
              setParams({ ['page']: pagination.selectedPage });
            "
          >
            {{ pagination.endPage - 1 }}
          </button>
        </div>
      </li>
      <li v-for="page in pagination.pages" :key="`page-${page}`">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            {
              'font-medium border-t-4 !border-primary-700':
                pagination.selectedPage === page,
            },
          ]"
        >
          <button
            type="button"
            :class="[
              'px-4 py-3 md:w-12 text-neutral-500 rounded-md hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900',
              {
                '!text-neutral-900 hover:!text-primary-800 active:!text-primary-900':
                  pagination.selectedPage === page,
              },
            ]"
            :aria-current="pagination.selectedPage === page"
            @click="
              pagination.setPage(page);
              setParams({ ['page']: page });
            "
          >
            {{ page }}
          </button>
        </div>
      </li>
      <li v-if="maxVisiblePages === 1 && pagination.selectedPage === 1">
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            aria-label="Second page"
            @click="
              pagination.setPage(2);
              setParams({ ['page']: 2 });
            "
          >
            2
          </button>
        </div>
      </li>
      <li v-if="pagination.endPage < pagination.totalPages - 1">
        <div class="flex pt-1 border-t-4 border-transparent">
          <button
            type="button"
            disabled
            aria-hidden="true"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500"
          >
            ...
          </button>
        </div>
      </li>
      <li v-if="!pagination.pages.includes(pagination.totalPages)">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            {
              'font-medium border-t-4 !border-primary-500':
                pagination.selectedPage === pagination.totalPages,
            },
          ]"
        >
          <button
            type="button"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.totalPages === pagination.selectedPage"
            @click="
              pagination.setPage(pagination.totalPages);
              setParams({ ['page']: pagination.totalPages });
            "
          >
            {{ pagination.totalPages }}
          </button>
        </div>
      </li>
    </ul>
    <SfButton
      type="button"
      size="lg"
      aria-label="Go to next page"
      :disabled="pagination.selectedPage >= pagination.totalPages"
      variant="tertiary"
      class="gap-3"
      @click="
        pagination.next();
        setParams({ ['page']: pagination.selectedPage });
      "
    >
      <span class="hidden sm:inline-flex">Next</span>
      <template #suffix>
        <SfIconChevronRight />
      </template>
    </SfButton>
  </nav>
</template>

