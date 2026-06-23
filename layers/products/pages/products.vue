<script setup lang="ts">
import { useRequestURL } from 'nuxt/app'

const PAGE_PATH = '/products'
const TITLE = 'All Products | Browse our full catalog'
// Visible on-page heading (the SEO TITLE above keeps its "| Browse…" suffix).
const HEADING = 'All Products'
const DESCRIPTION
  = 'Browse the full product catalog. Filter by attributes and price, sort, and explore everything we have to offer.'

const breadcrumbs = [
  { label: 'Home', link: '/' },
  { label: 'Products', link: '' },
]

// Canonical always points to the clean base /products to consolidate
// indexing signals from filtered/paginated variants (?page=2, ?Color=red).
const { origin } = useRequestURL()
const canonical = `${origin}${PAGE_PATH}`

useHead({
  title: TITLE,
  meta: [
    { name: 'title', content: TITLE },
    { name: 'description', content: DESCRIPTION },
    { name: 'og:title', content: TITLE },
    { name: 'og:description', content: DESCRIPTION },
    { name: 'twitter:title', content: TITLE },
    { name: 'twitter:description', content: DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: canonical }],
})
</script>

<template>
  <UiProductListing
    :breadcrumbs="breadcrumbs"
    :heading="HEADING"
    :description="DESCRIPTION"
    :items-per-page="18"
    state-key="products-page"
    default-sort="popular,DESC"
  />
</template>
