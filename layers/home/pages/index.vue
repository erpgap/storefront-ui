<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { absoluteImageUrl } from '~/utils/odooImage'
import { useWebsiteHomePage } from '~~/layers/core/composables/useWebsiteHomePage.ts'
import { useCmsPage } from '~~/layers/cms/composables/useCmsPage'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

await getWebsiteHomepage()
const { origin, pathname } = useRequestURL()

/**
 * SEO still comes from Odoo's websiteHomepage, NOT from the CMS page.
 *
 * The homepage's metadata - title, description, og and twitter tags, jsonLd -
 * is configured on the website record and is unrelated to which blocks the
 * merchant has arranged below. Letting the CMS page supply it would silently
 * replace a tuned set of tags with a page title, which is the regression this
 * migration most needs to avoid.
 */
// Odoo hands the share image out as a /web/image path, which neither exists
// on this domain nor is something share crawlers resolve.
useHead(generateSeo<SeoEntity>({
  ...websiteHomepage.value,
  metaImage: absoluteImageUrl(
    websiteHomepage.value?.metaImage,
    String(useRuntimeConfig().public.odooBaseImageUrl ?? ''),
    origin,
  ) || null,
}, 'Home', `${origin}${pathname}`))

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
const { data: cmsPage } = cmsEnabled
  ? await useCmsPage('/')
  : { data: ref(null) }

const blocks = computed(() => cmsPage.value?.blocks ?? [])
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
