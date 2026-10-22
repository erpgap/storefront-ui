// The CMS's type vocabulary: what a field, a block schema, a block instance
// and a page are. Shared by the engine (layers/cms) and by whichever block
// catalogue the storefront plugs in through `#cms-blocks` (layers/cms-blocks),
// which is why it imports nothing - a catalogue can depend on it without
// creating a cycle with blocks.ts, which depends on the catalogue.

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
  // Real relational references into Odoo. These are the capability a separate
  // headless CMS could not provide without an id-sync job, and the reason the
  // content lives in Odoo at all.
  | 'product-ref'
  | 'category-ref'

interface FieldCommon {
  name: string
  label?: string
  /** Shown under the control in the inspector. */
  help?: string
  required?: boolean
  /**
   * Keep the canvas placeholder away from this field.
   *
   * For a button or link label, empty does not mean "text missing" - it means
   * there is no button. Standing the field name in its place conjures a
   * finished-looking control the merchant never asked for, which is worse
   * than the blank it replaces.
   */
  noPlaceholder?: boolean
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

export interface RefField extends FieldCommon {
  type: 'product-ref' | 'category-ref'
  /** Maximum number of records that can be picked. */
  max?: number
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
  | RefField

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

/**
 * Meta title and description per language, as stored - a language with no
 * text of its own is absent rather than filled with English. Every page
 * stores its own, the homepage included.
 */
export interface CmsSeo {
  /**
   * Structured data for this page, as the storefront will emit it. Computed
   * in Odoo and shown read-only: it is derived from the page, not written.
   */
  jsonLd?: string | null
  /** Share image (og:image). Not per language. Odoo-relative or a storefront path. */
  image?: string | null
  title: Record<string, string>
  description: Record<string, string>
}

export interface CmsPage {
  id: string
  title: string
  /** A page, or a region: blocks the storefront places inside a page it owns. */
  kind?: 'page' | 'region'
  /** For a region, the key the storefront places it by, e.g. `category-after`. */
  regionKey?: string
  /** Created by the storefront (the homepage, the regions): cannot be deleted or moved. */
  isSystem?: boolean
  /** Leading-slash path, e.g. `/summer-sale`. Unique. */
  slug: string
  metaTitle?: string
  metaDescription?: string
  /** Share image (og:image), Odoo-relative or a storefront path. */
  metaImage?: string
  /**
   * Structured data the storefront emits for this page: the business for the
   * homepage, a breadcrumb for every other. Computed in Odoo, never authored.
   */
  jsonLd?: string
  /** Editor reads only. */
  seo?: CmsSeo
  published: boolean
  /** What the editor edits. */
  draft: BlockInstance[]
  /** What the storefront renders. Only `publish` copies draft over this. */
  publishedBlocks: BlockInstance[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

/** Upgrades one block's `data` from one schema version to the next. */
export type BlockMigration = (data: Record<string, unknown>) => Record<string, unknown>
