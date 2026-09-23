<script setup lang="ts">
// The render target for CMS pages — the component that was missing entirely
// (§4.2 gap 1). Fetches published blocks by URL and hands them to the SAME
// BlockRenderer the studio canvas uses.
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { DEFAULT_LOCALE, LOCALE_CODES } from '#shared/cms/i18n'
import { useCmsPage } from '../composables/useCmsPage'

const route = useRoute()

// Trailing slashes would otherwise make /about and /about/ two different pages.
const slug = computed(() => route.path.replace(/(.)\/$/, '$1'))

const { data: page } = await useCmsPage(slug.value)

// PoC: ?lang=pt so the published page can be seen in another language without
// reconfiguring the app's i18n (nuxt.config has one locale, strategy
// 'no_prefix'). The real implementation takes this from the route's locale
// prefix, and content languages come from Odoo's res.lang rather than from
// the Nuxt UI locale list — a merchant may sell in more languages than the
// storefront has UI translations for.
const requested = computed(() => String(useRoute().query.lang ?? ''))
const locale = computed(() =>
  LOCALE_CODES.includes(requested.value) ? requested.value : DEFAULT_LOCALE)

// A URL with no published page behind it is a 404, not an empty page. Without
// this the catch-all would answer 200 for every nonexistent URL on the site.
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const { origin } = useRequestURL()

useHead(generateSeo<SeoEntity>(
  {
    name: page.value.title,
    metaTitle: page.value.metaTitle || page.value.title,
    metaDescription: page.value.metaDescription,
  },
  'Page',
  `${origin}${slug.value}`,
))
</script>

<template>
  <div>
    <BlockRenderer
      :blocks="page!.blocks"
      :locale="locale"
    />
  </div>
</template>
