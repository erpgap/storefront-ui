<script setup lang="ts">
// A slot the storefront places inside a page it owns.
//
// Category and product pages are mostly business logic - listings, variants,
// cart, recommendations - and a merchant must not be able to rearrange them.
// So instead of making those pages editable, the developer declares WHERE
// content is allowed and the merchant fills it. There is nowhere else for a
// block to go, which makes the constraint structural rather than a rule
// somebody has to remember.
//
// Adding another slot is one line in a template.
import type { BlockInstance } from '#shared/cms/blocks'

const props = defineProps<{
  /** Matches the region declared in Odoo, e.g. `category-after`. */
  name: string
}>()

const { data } = await useFetch<{ blocks: BlockInstance[] } | null>(
  '/api/cms/region',
  {
    query: { key: props.name },
    key: `cms-region:${props.name}`,
    // A region that cannot be loaded must never take the page down with it.
    // The page's own content is what matters; this is an addition to it.
    default: () => null,
  },
)

const blocks = computed(() => data.value?.blocks ?? [])
</script>

<template>
  <!-- An empty region renders nothing at all, so a storefront with no CMS
       content looks exactly as it did before any of this existed. -->
  <BlockRenderer
    v-if="blocks.length"
    :blocks="blocks"
  />
</template>
