// The block engine — seeding, validation, rendering helpers and migrations,
// for whatever blocks the storefront's catalogue declares.
//
// This file lives in the layer's `shared/` on purpose: it is imported by the
// browser (palette, inspector, seed data), by the SSR render path, AND by the
// Nitro API that validates what gets written. One definition, three surfaces,
// no drift. See docs/CMS_ARCHITECTURE.md §5.3/§5.4/§6.3.
//
// It knows no block by name. The schemas come from the catalogue behind the
// `#cms-blocks` alias (layers/cms-blocks/schemas.ts in this storefront), and
// the binding of a block name to its real component happens in
// `layers/cms/blocks/index.ts`, because the server must be able to validate a
// page without loading a component tree. It contains NO Vue imports.

import {
  DEFAULT_LOCALE,
  hasValueFor,
  resolveValue,
  toMap,
} from './i18n'
import { isTranslatable } from './types'
import type { BlockInstance, BlockSchema, Field } from './types'
import { blockMigrations, blockSchemas } from '#cms-blocks/schemas'

export * from './types'
export { blockSchemas }

export const schemasByType: Record<string, BlockSchema> = Object.fromEntries(
  blockSchemas.map(schema => [schema.name, schema]),
)

export function getBlockSchema(blockType: string): BlockSchema | undefined {
  return schemasByType[blockType]
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function defaultForField(field: Field): unknown {
  switch (field.type) {
    case 'array':
      // Seed exactly `min` rows - not "at least one". Forcing a row into an
      // array with no minimum meant a brand-new page arrived already failing
      // validation: the hero's optional buttons seeded one empty row whose
      // label is required, so the merchant was told to fix something before
      // they had typed a character.
      //
      // Blocks that genuinely need a row declare min: 1, and their empty
      // required fields do correctly block publishing until filled.
      return Array.from(
        { length: field.min ?? 0 },
        () => defaultsFor(field.fields),
      )
    case 'product-ref':
    case 'category-ref':
      return []
    case 'number':
      return field.default ?? field.min ?? 0
    case 'boolean':
      return field.default ?? false
    default:
      // isTranslatable is the single source of truth. A `select` also lands in
      // this branch and must NOT become a per-language map: "solid white" is
      // one choice, not one per language, and wrapping it produced values the
      // components could not read.
      return isTranslatable(field)
        ? { [DEFAULT_LOCALE]: field.default ?? '' }
        : field.default ?? ''
  }
}

export function defaultsFor(fields: Field[]): Record<string, unknown> {
  return Object.fromEntries(fields.map(field => [field.name, defaultForField(field)]))
}

/** Seed values for a block freshly dragged out of the palette. */
export function seedBlockData(blockType: string): Record<string, unknown> {
  const schema = getBlockSchema(blockType)
  return schema ? defaultsFor(schema.fields) : {}
}

// ---------------------------------------------------------------------------
// Validation (§6.3) — runs on the SERVER, on every write
// ---------------------------------------------------------------------------
// `data` is an unvalidated JSON column, so this is the only thing standing
// between a buggy (or hostile) client and corrupt content. It does two jobs:
// reject what is malformed, and STRIP anything not in the schema, so unknown
// keys can never reach a component as props.

export interface ValidationIssue {
  path: string
  message: string
}

function coerce(
  field: Field,
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): unknown {
  switch (field.type) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(n)) {
        issues.push({ path, message: `${field.label ?? field.name} must be a number.` })
        return field.default ?? field.min ?? 0
      }
      if (field.min !== undefined && n < field.min) return field.min
      if (field.max !== undefined && n > field.max) return field.max
      return n
    }

    case 'boolean':
      return Boolean(value)

    case 'select': {
      const allowed = field.options.map(option => option.value)
      if (typeof value !== 'string' || !allowed.includes(value)) {
        issues.push({
          path,
          message: `${field.label ?? field.name} must be one of: ${allowed.join(', ')}.`,
        })
        return field.default ?? allowed[0]
      }
      return value
    }

    case 'product-ref':
    case 'category-ref': {
      // Ids only. The names and images the inspector shows are fetched live
      // from Odoo and deliberately never stored: a cached product name is a
      // product name that goes stale.
      if (!Array.isArray(value)) return []

      const ids = value
        .map(item => Number(item))
        .filter(id => Number.isInteger(id) && id > 0)

      if (field.max !== undefined && ids.length > field.max) {
        issues.push({
          path,
          message: `${field.label ?? field.name} allows at most ${field.max}.`,
        })
      }

      if (field.required && !ids.length) {
        issues.push({ path, message: `${field.label ?? field.name} is required.` })
      }

      return field.max !== undefined ? ids.slice(0, field.max) : ids
    }

    case 'array': {
      if (!Array.isArray(value)) {
        issues.push({ path, message: `${field.label ?? field.name} must be a list.` })
        return []
      }
      if (field.max !== undefined && value.length > field.max) {
        issues.push({
          path,
          message: `${field.label ?? field.name} allows at most ${field.max} items.`,
        })
      }
      return value
        .slice(0, field.max ?? value.length)
        .map((row, index) => validateData(
          field.fields,
          row as Record<string, unknown>,
          `${path}[${index}]`,
          issues,
        ))
    }

    // text / textarea / link / image — all per-language (§11 option 1).
    default: {
      // `toMap` also drops unknown language keys. The value map's keys come
      // from the client, so an unrecognised one is a bug or an attempt to
      // smuggle data through a column Odoo treats as opaque.
      const byLocale = toMap(value)
      const out: Record<string, string> = {}

      for (const [locale, rawValue] of Object.entries(byLocale)) {
        let text = rawValue

        if (field.type === 'link' && text && !/^(\/|https?:\/\/|mailto:|tel:)/.test(text)) {
          // Blocks a `javascript:` URL reaching an <a href>. Checked per
          // language, because each one is a separate URL.
          issues.push({
            path: `${path}.${locale}`,
            message: `${field.label ?? field.name} must start with / or http.`,
          })
          text = ''
        }

        out[locale] = field.maxLength ? text.slice(0, field.maxLength) : text
      }

      // `required` is enforced against the DEFAULT language only. Blocking a
      // publish because Portuguese is unfinished would make translation a
      // gate on shipping English, which is backwards — untranslated fields
      // fall back to the default language and the page still renders.
      // Region-tolerant: content written as `en` satisfies a required field
      // when the default locale is `en_US`. Without this, installing a
      // regional language in Odoo would make every existing page fail to
      // publish.
      if (field.required && !hasValueFor(out, DEFAULT_LOCALE)) {
        issues.push({ path, message: `${field.label ?? field.name} is required.` })
      }

      return out
    }
  }
}

function validateData(
  fields: Field[],
  data: Record<string, unknown> | undefined,
  path: string,
  issues: ValidationIssue[],
): Record<string, unknown> {
  const input = (data && typeof data === 'object') ? data : {}
  const out: Record<string, unknown> = {}

  // Iterating the SCHEMA, not the input, is what strips unknown keys.
  for (const field of fields) {
    const key = path ? `${path}.${field.name}` : field.name
    out[field.name] = coerce(field, input[field.name], key, issues)
  }

  return out
}

/**
 * Validates and normalises a whole page's worth of blocks.
 *
 * Returns the cleaned blocks alongside the issues, so a caller can choose to
 * save a draft that has warnings (merchants save half-finished work all the
 * time) while `publish` refuses.
 */
export function validateBlocks(blocks: unknown): {
  blocks: BlockInstance[]
  issues: ValidationIssue[]
} {
  const issues: ValidationIssue[] = []

  if (!Array.isArray(blocks)) {
    return { blocks: [], issues: [{ path: '', message: 'Blocks must be a list.' }] }
  }

  const cleaned: BlockInstance[] = []

  blocks.forEach((raw, index) => {
    const block = raw as Partial<BlockInstance>
    const schema = block?.blockType ? getBlockSchema(block.blockType) : undefined

    if (!schema) {
      issues.push({
        path: `blocks[${index}]`,
        message: `Unknown block type "${String(block?.blockType)}".`,
      })
      return
    }

    cleaned.push({
      id: typeof block.id === 'string' && block.id ? block.id : `blk_${index}_${Date.now()}`,
      blockType: schema.name,
      // Anything written now matches the current schema by definition, since
      // it was just validated against it.
      schemaVersion: schema.version ?? 1,
      data: validateData(schema.fields, block.data, `blocks[${index}]`, issues),
    })
  })

  return { blocks: cleaned, issues }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Flattens a block's stored data into plain props for one language.
 *
 * This is the seam that keeps the storage shape invisible: components receive
 * `title: "Saldos de Verão"`, exactly as they did before multi-language
 * existed, and know nothing about locales. Untranslated fields fall back to
 * the default language, so a half-translated page still renders completely.
 */
export function resolveBlockData(
  blockType: string,
  data: Record<string, unknown>,
  locale: string,
): Record<string, unknown> {
  const schema = getBlockSchema(blockType)
  if (!schema) return {}

  const resolveFields = (
    fields: Field[],
    source: Record<string, unknown>,
  ): Record<string, unknown> => {
    const out: Record<string, unknown> = {}

    for (const field of fields) {
      const raw = source?.[field.name]

      if (field.type === 'array') {
        out[field.name] = Array.isArray(raw)
          ? raw.map(row => resolveFields(field.fields, row as Record<string, unknown>))
          : []
        continue
      }

      out[field.name] = isTranslatable(field)
        ? resolveValue(raw, locale)
        : raw
    }

    return out
  }

  return resolveFields(schema.fields, data)
}

/**
 * Fills empty text with the field's own label, for the editor canvas only.
 *
 * An unwritten heading renders as nothing, so a block a merchant has just
 * added can look broken or simply absent - there is no way to see where the
 * words will land. Showing "Heading" where the heading goes answers that, the
 * way the hatched box answers it for a picture.
 *
 * Only `text` and `textarea`. A link is skipped because a placeholder url is a
 * destination, and a wrong one is worse than none; images have their own
 * stand-in; selects always have a value already.
 *
 * This never touches stored data. It runs on resolved props on their way to a
 * component, so nothing here can be saved or published by accident.
 */
export function withFieldPlaceholders(
  blockType: string,
  resolved: Record<string, unknown>,
): Record<string, unknown> {
  const schema = getBlockSchema(blockType)
  if (!schema) return resolved

  const fill = (
    fields: Field[],
    source: Record<string, unknown>,
  ): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...source }

    for (const field of fields) {
      const value = source?.[field.name]

      if (field.type === 'array') {
        if (Array.isArray(value)) {
          out[field.name] = value.map(row =>
            fill(field.fields, row as Record<string, unknown>))
        }
        continue
      }

      if (field.type !== 'text' && field.type !== 'textarea') continue
      if (field.noPlaceholder) continue
      if (typeof value === 'string' && value.trim()) continue

      out[field.name] = field.label
    }

    return out
  }

  return fill(schema.fields, resolved)
}

/**
 * Every label `withFieldPlaceholders` can put on the canvas, for this block.
 *
 * The editor shell needs to recognise a placeholder once it is rendered, and
 * by then it is just a string inside whatever element the component chose. It
 * matches against this list rather than guessing.
 */
export function placeholderLabels(blockType: string): string[] {
  const schema = getBlockSchema(blockType)
  if (!schema) return []

  const collect = (fields: Field[]): string[] =>
    fields.flatMap((field) => {
      if (field.type === 'array') return collect(field.fields)
      if (field.noPlaceholder) return []
      return field.type === 'text' || field.type === 'textarea' ? [field.label] : []
    })

  return [...new Set(collect(schema.fields))]
}

/** Fields in this block with no value in `locale`. Drives the "not yet translated" hint. */
export function untranslatedFields(
  blockType: string,
  data: Record<string, unknown>,
  locale: string,
): number {
  const schema = getBlockSchema(blockType)
  if (!schema || locale === DEFAULT_LOCALE) return 0

  const count = (fields: Field[], source: Record<string, unknown>): number =>
    fields.reduce((total, field) => {
      const raw = source?.[field.name]

      if (field.type === 'array') {
        return total + (Array.isArray(raw)
          ? raw.reduce((sum: number, row) =>
              sum + count(field.fields, row as Record<string, unknown>), 0)
          : 0)
      }

      // Only prose counts as outstanding work. An untranslated IMAGE or LINK is
      // INHERITED, not missing: the page uses the default language's value and
      // that is usually the correct answer — most links and most photos are the
      // same in every market. Flagging them would bury the fields that do need
      // a human behind ones that never will.
      if (field.type !== 'text' && field.type !== 'textarea') return total

      // Only fields that actually HAVE default-language content count as
      // missing. An empty optional field is not outstanding translation work.
      const map = toMap(raw)
      const hasSource = (map[DEFAULT_LOCALE] ?? '').trim().length > 0
      const hasTarget = (map[locale] ?? '').trim().length > 0

      return total + (hasSource && !hasTarget ? 1 : 0)
    }, 0)

  return count(schema.fields, data)
}

// ---------------------------------------------------------------------------
// Schema migrations
// ---------------------------------------------------------------------------
// Block content outlives the schema that wrote it. A merchant's page published
// last year must keep rendering after a block gains, loses or renames a field.
//
// Migrations live with the catalogue, next to the schemas whose shapes they
// translate, rather than in Odoo. Odoo stores the content and does not know
// what a block is, so a SQL migration there could not be written against the
// schema that defines the shape, nor tested against it. There they are
// ordinary functions; this is the part that runs them.
//
// They run on READ, so nothing has to be rewritten in the database for old
// content to work. A one-off script can apply them eagerly when convenient.

export function currentSchemaVersion(blockType: string): number {
  return getBlockSchema(blockType)?.version ?? 1
}

/** Brings one block up to its schema's current version. */
export function migrateBlock(block: BlockInstance): BlockInstance {
  const target = currentSchemaVersion(block.blockType)
  let version = block.schemaVersion ?? 1

  if (version >= target) {
    return block.schemaVersion === version ? block : { ...block, schemaVersion: version }
  }

  let data = block.data
  const chain = blockMigrations[block.blockType] ?? {}

  while (version < target) {
    const step = chain[version]
    if (!step) {
      // A gap in the chain would silently hand a component the wrong shape.
      // Stopping leaves the block on its old version, where the renderer's
      // prop defaults still apply, rather than pretending it was upgraded.
      console.warn(
        `[cms] no migration for ${block.blockType} v${version} -> v${version + 1}`,
      )
      break
    }
    data = step(data)
    version += 1
  }

  return { ...block, schemaVersion: version, data }
}

export function migrateBlocks(blocks: BlockInstance[]): BlockInstance[] {
  return blocks.map(migrateBlock)
}

/** How many blocks are not yet on their current schema version. */
export function outdatedBlockCount(blocks: BlockInstance[]): number {
  return blocks.filter(
    block => (block.schemaVersion ?? 1) < currentSchemaVersion(block.blockType),
  ).length
}
