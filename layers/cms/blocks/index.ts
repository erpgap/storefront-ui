// Binds each block schema to the REAL storefront component that renders it.
//
// The split matters: schemas live in `shared/cms/blocks.ts` (no Vue, so the
// Nitro validator can import them), and this file — the only place that knows
// about components — is client/SSR only.
//
// Every entry below points at a component that already existed before the CMS.
// None of them are CMS-specific re-implementations. That is what guarantees the
// editor canvas and the production page are the same pixels (§5.1).

import type { Component } from 'vue'
import { blockSchemas, getBlockSchema } from '#shared/cms/blocks'
import type { BlockSchema } from '#shared/cms/blocks'

type Loader = () => Promise<Component | { default: Component }>

/**
 * Blocks that fetch their own data and therefore need a per-instance cache key
 * (§9.1). BlockRenderer passes `blockId` only to these, so every other
 * component stays free of an attribute it never asked for.
 */
export const BLOCKS_NEEDING_ID = new Set(['bestSellers', 'featuredProducts'])

const components: Record<string, Loader> = {
  hero: () => import('~~/layers/core/components/MainBanner.vue'),
  categories: () => import('~~/layers/core/components/Categories.vue'),
  bestSellers: () => import('~~/layers/core/components/BestSellers.vue'),
  featuredProducts: () => import('../components/CmsFeaturedProducts.vue'),
  editorial: () => import('~~/layers/core/components/BannerRight.vue'),
  valueProps: () => import('~~/layers/core/components/ValueProps.vue'),
  richText: () => import('../components/CmsRichText.vue'),
  newsletter: () => import('~~/layers/core/components/Newsletter.vue'),
}

export interface BlockDefinition extends BlockSchema {
  component: Loader
}

export const blockRegistry: BlockDefinition[] = blockSchemas
  .filter(schema => schema.name in components)
  .map(schema => ({ ...schema, component: components[schema.name]! }))

export function getBlockComponent(blockType: string): Loader | undefined {
  return components[blockType]
}

export function getBlockDefinition(blockType: string): BlockDefinition | undefined {
  const schema = getBlockSchema(blockType)
  const component = components[blockType]
  return schema && component ? { ...schema, component } : undefined
}

export function blockLabel(blockType: string): string {
  return getBlockSchema(blockType)?.label ?? blockType
}
