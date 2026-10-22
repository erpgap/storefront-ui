// Binds each block in `schemas.ts` to the REAL storefront component that
// renders it. The CMS engine reads this through the `#cms-blocks/registry`
// alias, client/SSR only - the server never loads it.
//
// Every entry points at a component that already existed before the CMS, or at
// one of this layer's own. None of them are CMS-specific re-implementations of
// a storefront component. That is what guarantees the editor canvas and the
// production page are the same pixels (§5.1).

import type { BlockLoader } from '#cms/blocks'

export const blockComponents: Record<string, BlockLoader> = {
  hero: () => import('~~/layers/core/components/MainBanner.vue'),
  categories: () => import('~~/layers/core/components/Categories.vue'),
  bestSellers: () => import('~~/layers/core/components/BestSellers.vue'),
  featuredProducts: () => import('./components/CmsFeaturedProducts.vue'),
  editorial: () => import('~~/layers/core/components/BannerRight.vue'),
  valueProps: () => import('~~/layers/core/components/ValueProps.vue'),
  richText: () => import('./components/CmsRichText.vue'),
  pageHeader: () => import('./components/CmsPageHeader.vue'),
  featureList: () => import('./components/CmsFeatureList.vue'),
  stats: () => import('./components/CmsStats.vue'),
  infoRows: () => import('./components/CmsInfoRows.vue'),
  faq: () => import('./components/CmsFaq.vue'),
  cardGrid: () => import('./components/CmsCardGrid.vue'),
  contactForm: () => import('./components/CmsContactForm.vue'),
  newsletter: () => import('~~/layers/core/components/Newsletter.vue'),
}

/**
 * Blocks that fetch their own data and therefore need a per-instance cache key
 * (§9.1). BlockRenderer passes `blockId` only to these, so every other
 * component stays free of an attribute it never asked for.
 */
export const blocksNeedingId = new Set(['bestSellers', 'featuredProducts'])
