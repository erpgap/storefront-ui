// Joins the catalogue's block schemas to the components that render them.
//
// The split matters: schemas live in `#cms-blocks/schemas` (no Vue, so the
// Nitro validator can import them), the component bindings in
// `#cms-blocks/registry`, and this file — the only place in the engine that
// touches components — is client/SSR only. Which blocks exist, and which
// components draw them, is the storefront's call (layers/cms-blocks here).

import type { Component } from 'vue'
import { blockComponents, blocksNeedingId } from '#cms-blocks/registry'
import { blockSchemas, getBlockSchema } from '#cms/shared/blocks'
import type { BlockSchema } from '#cms/shared/blocks'

export type BlockLoader = () => Promise<Component | { default: Component }>

/** See `blocksNeedingId` in the catalogue's registry. */
export const BLOCKS_NEEDING_ID: ReadonlySet<string> = blocksNeedingId

export interface BlockDefinition extends BlockSchema {
  component: BlockLoader
}

/**
 * Sorted by label, because this is the order the palette shows.
 *
 * The schemas are declared in rough page order - hero first, newsletter last -
 * which reads well in the source and poorly in a list of fifteen tiles, where
 * there is no way to guess where "Key Numbers" sits. Alphabetical is the order a
 * merchant can predict without learning it.
 *
 * `localeCompare` rather than `<`, so accented labels sort where a reader
 * expects rather than after Z.
 */
export const blockRegistry: BlockDefinition[] = blockSchemas
  .filter(schema => schema.name in blockComponents)
  .map(schema => ({ ...schema, component: blockComponents[schema.name]! }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function getBlockComponent(blockType: string): BlockLoader | undefined {
  return blockComponents[blockType]
}

export function getBlockDefinition(blockType: string): BlockDefinition | undefined {
  const schema = getBlockSchema(blockType)
  const component = blockComponents[blockType]
  return schema && component ? { ...schema, component } : undefined
}

export function blockLabel(blockType: string): string {
  return getBlockSchema(blockType)?.label ?? blockType
}
