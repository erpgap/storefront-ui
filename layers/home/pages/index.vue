<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { absoluteImageUrl } from '~/utils/odooImage'
import { useWebsiteHomePage } from '~~/layers/core/composables/useWebsiteHomePage.ts'
import { useCmsPage } from '~~/layers/cms/composables/useCmsPage'
import { DEFAULT_LOCALE, resolveValue } from '#shared/cms/i18n'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

await getWebsiteHomepage()
const { origin, pathname } = useRequestURL()

/**
 * The homepage renders from the CMS when a published page exists for `/`, and
 * from the markup below when it does not.
 *
 * The flag exists so the two can be compared on a production build and so the
 * old path is one environment variable away if anything regresses. It is not
 * meant to live forever.
 */
// Parsed rather than trusted: a NUXT_PUBLIC_* runtime override is always a
// string, so '0' and 'false' are truthy and a bare check can never be
// switched off once the build baked it on.
const cmsEnabled = ['1', 'true'].includes(
  String(useRuntimeConfig().public.cmsHomepage ?? '').toLowerCase(),
)
/**
 * Fetched whether or not the flag is on, because the flag decides which markup
 * renders - it does not decide where the page's metadata lives. Gating this
 * meant a storefront running the old homepage had no title or description of
 * its own and fell back to the website record, which is exactly the regression
 * centralising the SEO was supposed to remove.
 */
const { data: cmsPage } = await useCmsPage('/')

const blocks = computed(() => (cmsEnabled ? cmsPage.value?.blocks ?? [] : []))

const odooImageBase = String(useRuntimeConfig().public.odooBaseImageUrl ?? '')

// Same fallback as every other CMS page: with no share image chosen, the first
// picture on the page previews better than none.
const firstBlockImage = computed(() => {
  for (const block of blocks.value) {
    const image = resolveValue(block.data?.image, DEFAULT_LOCALE)
    if (image) return image
  }
  return ''
})

/**
 * Every tag comes from the CMS page, jsonLd included. The homepage's is still
 * the OnlineStore block describing the business rather than a breadcrumb, but
 * Odoo decides that and computes it - the storefront renders whatever the page
 * carries, exactly as it does for every other page.
 *
 * Falling back to the page's own name before the website record, so a page
 * whose meta title was never filled in is still titled after itself rather
 * than after the site. The website record comes last, for an install that has
 * not run the migration yet.
 */
useHead(() => generateSeo<SeoEntity>({
  ...websiteHomepage.value,
  jsonLd: cmsPage.value?.jsonLd || websiteHomepage.value?.jsonLd,
  metaTitle: cmsPage.value?.metaTitle
    || cmsPage.value?.title
    || websiteHomepage.value?.metaTitle,
  metaDescription: cmsPage.value?.metaDescription || websiteHomepage.value?.metaDescription,
  // Odoo hands the share image out as a /web/image path, which neither exists
  // on this domain nor is something share crawlers resolve.
  metaImage: absoluteImageUrl(
    cmsPage.value?.metaImage || websiteHomepage.value?.metaImage || firstBlockImage.value,
    odooImageBase,
    origin,
  ) || null,
}, 'Home', `${origin}${pathname}`))
</script>

<template>
  <div>
    <!-- Block 0 hydrates eagerly and everything after it defers until visible,
         which is the same arrangement as the hand-written markup below - see
         BlockRenderer. -->
    <BlockRenderer
      v-if="blocks.length"
      :blocks="blocks"
    />

    <template v-else>
      <!-- MainBanner is the hero (above the fold) — hydrate normally. Everything
           below is server-rendered for SEO but defers client hydration until it
           scrolls into view, cutting initial main-thread work / unused JS. -->
      <MainBanner />
      <LazyCategories hydrate-on-visible />
      <LazyBestSellers hydrate-on-visible />
      <LazyBannerRight hydrate-on-visible />
      <LazyValueProps hydrate-on-visible />
    </template>
  </div>
</template>
