// The block vocabulary — the single source of truth for the whole CMS.
//
// This file lives in `shared/` (Nuxt 4) on purpose: it is imported by the
// browser (palette, inspector, seed data), by the SSR render path, AND by the
// Nitro API that validates what gets written. One definition, three surfaces,
// no drift. See docs/CMS_ARCHITECTURE.md §5.3/§5.4/§6.3.
//
// It contains NO Vue imports. The binding of a block name to its real
// storefront component happens in `layers/cms/blocks/index.ts`, because the
// server must be able to validate a page without loading a component tree.

import {
  DEFAULT_LOCALE,
  hasValueFor,
  resolveValue,
  toMap,
} from './i18n'

// ---------------------------------------------------------------------------
// Field vocabulary
// ---------------------------------------------------------------------------
// Each type here corresponds to exactly one inspector widget. Adding a *block*
// costs zero editor code; adding a *field type* costs one widget. That
// asymmetry is the leverage — keep this list short.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'link'
  | 'number'
  | 'boolean'
  | 'select'
  | 'array'

interface FieldCommon {
  name: string
  label?: string
  /** Shown under the control in the inspector. */
  help?: string
  required?: boolean
}

export interface TextField extends FieldCommon {
  type: 'text' | 'textarea' | 'image' | 'link'
  default?: string
  maxLength?: number
}

export interface NumberField extends FieldCommon {
  type: 'number'
  default?: number
  min?: number
  max?: number
}

export interface BooleanField extends FieldCommon {
  type: 'boolean'
  default?: boolean
}

export interface SelectField extends FieldCommon {
  type: 'select'
  options: { value: string, label: string }[]
  default?: string
}

export interface ArrayField extends FieldCommon {
  type: 'array'
  /** Shape of each row. Nested arrays are deliberately unsupported (§9.4). */
  fields: Field[]
  min?: number
  max?: number
  /** Which sub-field to show as the row summary in the inspector. */
  titleField?: string
  /** Label for the "add row" button, e.g. "Add category". */
  addLabel?: string
}

export type Field =
  | TextField
  | NumberField
  | BooleanField
  | SelectField
  | ArrayField

/**
 * Which field types hold language-specific content.
 *
 * `text`, `textarea` and `link` are obvious. `image` is included because
 * markets genuinely differ — packshots with baked-in text, seasonal imagery,
 * regional models. `select`, `number` and `boolean` are structural choices, not
 * content: "show 4 products" is the same decision in every language, and
 * translating it would be meaningless.
 */
const TRANSLATABLE_TYPES = new Set<FieldType>(['text', 'textarea', 'link', 'image'])

export function isTranslatable(field: Field): boolean {
  return TRANSLATABLE_TYPES.has(field.type)
}

export interface BlockSchema {
  /** Stable identifier. This is what is persisted as `blockType`. */
  name: string
  /** Current schema version. Omitted means 1. */
  version?: number
  /** Human label for the palette. */
  label: string
  /** One-line description for the palette. */
  description: string
  /**
   * Blocks that fetch their own data from Odoo. The editor shows a note
   * explaining that content comes from the catalogue, not from these fields.
   */
  dynamic?: boolean
  fields: Field[]
}

/** A block instance as stored on a page. `data` is the JSON column. */
export interface BlockInstance {
  id: string
  blockType: string
  /**
   * Which version of this block's schema `data` was written against.
   *
   * Content outlives the schema that produced it. When a block's fields change
   * shape, old content keeps rendering and is upgraded on read by the
   * migrations below - a pure function in TypeScript, unit testable, rather
   * than a SQL migration in a repository that does not know what a block is.
   *
   * Absent means version 1, which is how every block written before this
   * existed is treated.
   */
  schemaVersion?: number
  data: Record<string, unknown>
}

export interface CmsPage {
  id: string
  title: string
  /** Leading-slash path, e.g. `/summer-sale`. Unique. */
  slug: string
  metaTitle?: string
  metaDescription?: string
  published: boolean
  /** What the editor edits. */
  draft: BlockInstance[]
  /** What the storefront renders. Only `publish` copies draft over this. */
  publishedBlocks: BlockInstance[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// ---------------------------------------------------------------------------
// The block registry
// ---------------------------------------------------------------------------
// Every entry points at a component that ALREADY EXISTS in layers/core. None of
// these are CMS-specific re-implementations — that is the guarantee that the
// editor canvas and the production page are the same pixels.

export const blockSchemas: BlockSchema[] = [
  {
    name: 'hero',
    label: 'Hero Banner',
    description: 'Full-bleed image with headline and buttons.',
    fields: [
      {
        name: 'eyebrow',
        label: 'Eyebrow',
        type: 'text',
        help: 'Small line above the headline. Leave empty for "New Collection — <year>".',
      },
      { name: 'title', label: 'Headline', type: 'text', required: true },
      { name: 'body', label: 'Body copy', type: 'textarea' },
      {
        name: 'image',
        label: 'Background image',
        type: 'image',
        default: '/img/home/hero.webp',
        required: true,
      },
      {
        name: 'ctas',
        label: 'Buttons',
        type: 'array',
        max: 2,
        titleField: 'label',
        addLabel: 'Add button',
        fields: [
          { name: 'label', label: 'Label', type: 'text', required: true },
          { name: 'url', label: 'Links to', type: 'link', default: '/products' },
          {
            name: 'style',
            label: 'Style',
            type: 'select',
            default: 'primary',
            options: [
              { value: 'primary', label: 'Solid (white)' },
              { value: 'secondary', label: 'Outline' },
            ],
          },
        ],
      },
    ],
  },

  {
    name: 'categories',
    label: 'Category Grid',
    description: 'Up to four linked category tiles.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Browse' },
      { name: 'title', label: 'Heading', type: 'text', default: 'Shop by Category' },
      { name: 'linkLabel', label: 'Corner link label', type: 'text', default: 'All categories' },
      { name: 'linkUrl', label: 'Corner link target', type: 'link', default: '/products' },
      {
        name: 'items',
        label: 'Categories',
        type: 'array',
        min: 1,
        max: 4,
        titleField: 'name',
        addLabel: 'Add category',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true },
          { name: 'link', label: 'Links to', type: 'link', default: '/products' },
        ],
      },
    ],
  },

  {
    name: 'bestSellers',
    label: 'Product Grid',
    description: 'Products pulled live from the Odoo catalogue.',
    // The merchant controls framing and query, never the product data itself.
    dynamic: true,
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Curated' },
      { name: 'title', label: 'Heading', type: 'text', default: 'Best Sellers' },
      { name: 'linkLabel', label: 'Corner link label', type: 'text', default: 'View all' },
      { name: 'linkUrl', label: 'Corner link target', type: 'link', default: '/products' },
      {
        name: 'pageSize',
        label: 'How many products',
        type: 'number',
        default: 4,
        min: 2,
        max: 12,
      },
      {
        name: 'sort',
        label: 'Order by',
        type: 'select',
        default: 'popular',
        options: [
          { value: 'popular', label: 'Most popular' },
          { value: 'newest', label: 'Newest first' },
          { value: 'priceAsc', label: 'Price: low to high' },
          { value: 'priceDesc', label: 'Price: high to low' },
        ],
      },
    ],
  },

  {
    name: 'editorial',
    label: 'Image + Text',
    description: 'Half-width image beside a block of copy.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Our Philosophy' },
      { name: 'title', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Body copy', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'imageAlt', label: 'Image description', type: 'text', help: 'Read aloud by screen readers.' },
      {
        name: 'imagePosition',
        label: 'Image on',
        type: 'select',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
      { name: 'ctaLabel', label: 'Button label', type: 'text' },
      { name: 'ctaUrl', label: 'Button links to', type: 'link', default: '/products' },
    ],
  },

  {
    name: 'valueProps',
    label: 'Value Props',
    description: 'Row of short selling points with icons.',
    fields: [
      {
        name: 'items',
        label: 'Points',
        type: 'array',
        min: 1,
        max: 4,
        titleField: 'title',
        addLabel: 'Add point',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'text', label: 'Subtitle', type: 'text' },
          {
            name: 'icon',
            label: 'Icon',
            type: 'select',
            default: 'shield',
            // A curated set, not raw SVG paths: merchants pick, and the markup
            // stays ours rather than becoming an injection surface.
            options: [
              { value: 'truck', label: 'Delivery' },
              { value: 'return', label: 'Returns' },
              { value: 'shield', label: 'Warranty' },
              { value: 'support', label: 'Support' },
            ],
          },
        ],
      },
    ],
  },

  {
    name: 'richText',
    label: 'Text Section',
    description: 'A heading and paragraphs, centred in the page.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      {
        name: 'body',
        label: 'Text',
        type: 'textarea',
        help: 'Blank lines start a new paragraph.',
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        default: 'center',
        options: [
          { value: 'center', label: 'Centred' },
          { value: 'left', label: 'Left' },
        ],
      },
    ],
  },

  {
    name: 'newsletter',
    label: 'Newsletter',
    description: 'Email signup band. Submissions go to Odoo.',
    dynamic: true,
    fields: [
      { name: 'title', label: 'Heading', type: 'text', default: 'Join the list' },
      {
        name: 'body',
        label: 'Body copy',
        type: 'textarea',
        default: 'Be first to know about new collections, private sales and design stories.',
      },
    ],
  },
]

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
// These migrations live here rather than in Odoo on purpose. Odoo stores the
// content and does not know what a block is, so a SQL migration there could
// not be written against the schema that defines the shape, nor tested against
// it. Here they are ordinary functions.
//
// They run on READ, so nothing has to be rewritten in the database for old
// content to work. A one-off script can apply them eagerly when convenient.

type BlockMigration = (data: Record<string, unknown>) => Record<string, unknown>

/**
 * Keyed by block type, then by the version being migrated FROM.
 *
 * `{ hero: { 1: fn } }` means "a hero at version 1 becomes version 2 by
 * running fn". Chains apply in order until the block reaches current.
 */
const migrations: Record<string, Record<number, BlockMigration>> = {
  // Example of the shape, kept deliberately:
  //
  // hero: {
  //   1: data => {
  //     const { body, ...rest } = data
  //     return { ...rest, subtitle: body }
  //   },
  // },
}

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
  const chain = migrations[block.blockType] ?? {}

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
