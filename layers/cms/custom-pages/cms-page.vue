<script setup lang="ts">
// The render target for CMS pages — the component that was missing entirely
// (§4.2 gap 1). Fetches published blocks by URL and hands them to the SAME
// BlockRenderer the studio canvas uses.
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { DEFAULT_LOCALE, isLocaleCode } from '#shared/cms/i18n'
import { useCmsPage } from '../composables/useCmsPage'

const route = useRoute()

// Trailing slashes would otherwise make /about and /about/ two different pages.
const slug = computed(() => route.path.replace(/(.)\/$/, '$1'))

const { data: page, error } = await useCmsPage(slug.value)

// PoC: ?lang=pt so the published page can be seen in another language without
// reconfiguring the app's i18n (nuxt.config has one locale, strategy
// 'no_prefix'). The real implementation takes this from the route's locale
// prefix, and content languages come from Odoo's res.lang rather than from
// the Nuxt UI locale list — a merchant may sell in more languages than the
// storefront has UI translations for.
const requested = computed(() => String(useRoute().query.lang ?? ''))
const locale = computed(() =>
  isLocaleCode(requested.value) ? requested.value : DEFAULT_LOCALE)

/**
 * A URL with no published page behind it is a 404, not an empty page -
 * otherwise the catch-all answers 200 for every nonexistent URL on the site.
 *
 * But that judgement belongs to the SERVER render, and only to it. On the
 * client this setup runs again during hydration, and a momentary failure
 * there - Odoo restarting, a dropped connection, a network blip - would
 * replace a page the visitor is already looking at with a 404. The symptom is
 * the page appearing correctly and then vanishing a split second later, which
 * is both alarming and wrong: the content was fine, the second fetch was not.
 *
 * So: the server decides. If the client ends up with nothing and the server
 * had something, keep what is on screen.
 */
if (import.meta.server && !page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

if (import.meta.client && !page.value) {
  // Worth a line in the console: the page is still rendered from the server
  // payload, but something is wrong with the client's view of the data.
  console.warn(
    `[cms] no data for ${slug.value} on the client`,
    error.value ? `(${error.value.message})` : '(empty response)',
  )
}

const { origin } = useRequestURL()

// Computed rather than evaluated once: `page` can be null on the client in the
// case above, and reading `.title` off it would throw where the whole point is
// to keep rendering.
useHead(() => generateSeo<SeoEntity>(
  {
    name: page.value?.title,
    metaTitle: page.value?.metaTitle || page.value?.title,
    metaDescription: page.value?.metaDescription,
  },
  'Page',
  `${origin}${slug.value}`,
))
</script>

<template>
  <div>
    <BlockRenderer
      v-if="page"
      :blocks="page.blocks"
      :locale="locale"
    />
  </div>
</template>
