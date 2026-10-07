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

// ---------------------------------------------------------------------------
// The block registry
// ---------------------------------------------------------------------------
// Every entry points at a component that ALREADY EXISTS in layers/core. None of
// these are CMS-specific re-implementations — that is the guarantee that the
// editor canvas and the production page are the same pixels.

/**
 * Vertical spacing for blocks that stack into one flow of content, the way a
 * page of text does: 'start' opens the flow below a banner, 'compact' follows
 * the block above it closely, 'end' does too and closes the page with room
 * before the footer, 'normal' stands alone as its own section.
 */
const spacingField = (fallback: 'normal' | 'start' | 'compact' | 'end' = 'normal'): SelectField => ({
  name: 'spacing',
  label: 'Spacing',
  type: 'select',
  default: fallback,
  options: [
    { value: 'normal', label: 'Section (space above and below)' },
    { value: 'start', label: 'First below a banner' },
    { value: 'compact', label: 'Follows the block above' },
    { value: 'end', label: 'Follows the block above, last on the page' },
  ],
})

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
        help: 'Small line above the headline. Leave empty to hide it.',
      },
      { name: 'title', label: 'Headline', type: 'text', required: true },
      { name: 'body', label: 'Body copy', type: 'textarea' },
      {
        name: 'image',
        label: 'Background image',
        type: 'image',
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
          { name: 'url', label: 'Links to', type: 'link' },
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
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'linkLabel', label: 'Corner link label', type: 'text' },
      { name: 'linkUrl', label: 'Corner link target', type: 'link' },
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
          { name: 'link', label: 'Links to', type: 'link' },
        ],
      },
    ],
  },

  {
    name: 'bestSellers',
    label: 'Products — Automatic',
    description: 'Fills itself from your catalogue by a rule: most popular, newest or price.',
    // The merchant controls framing and query, never the product data itself.
    dynamic: true,
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'linkLabel', label: 'Corner link label', type: 'text' },
      { name: 'linkUrl', label: 'Corner link target', type: 'link' },
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
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
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
      {
        name: 'titleSize',
        label: 'Heading size',
        type: 'select',
        default: 'large',
        options: [
          { value: 'large', label: 'Large (homepage)' },
          { value: 'regular', label: 'Regular (content pages)' },
        ],
      },
      { name: 'ctaLabel', label: 'Button label', type: 'text' },
      { name: 'ctaUrl', label: 'Button links to', type: 'link' },
    ],
  },

  {
    name: 'featuredProducts',
    label: 'Products — Hand-picked',
    description: 'You choose exactly which products appear, and the order they appear in.',
    dynamic: true,
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text', required: true },
      {
        name: 'productIds',
        label: 'Products',
        type: 'product-ref',
        max: 8,
        required: true,
        help: 'Prices and stock stay live from Odoo — only the selection is saved.',
      },
    ],
  },

  {
    name: 'valueProps',
    label: 'Selling Points',
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
    description: 'A heading, paragraphs, lists and links - or a highlighted notice.',
    fields: [
      {
        name: 'variant',
        label: 'Style',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'notice', label: 'Notice (boxed, with an icon)' },
        ],
      },
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text', help: 'In a notice, shown in bold before the text.' },
      {
        name: 'body',
        label: 'Text',
        type: 'textarea',
        help: 'Blank lines start a new paragraph. Lines starting with "- " make a list. '
          + 'Links: [label](/page) or [label](https://…).',
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
      {
        name: 'width',
        label: 'Width',
        type: 'select',
        default: 'column',
        options: [
          { value: 'column', label: 'Reading column, centred on the page' },
          { value: 'wide', label: 'Aligned with the page edge' },
        ],
      },
      {
        name: 'size',
        label: 'Text size',
        type: 'select',
        default: 'body',
        options: [
          { value: 'body', label: 'Regular' },
          { value: 'intro', label: 'Intro (slightly larger)' },
          { value: 'lead', label: 'Large statement' },
        ],
      },
      spacingField(),
      { name: 'divider', label: 'Line above', type: 'boolean', default: false, help: 'A full-width rule separating this from the block above.' },
      { name: 'ctaLabel', label: 'Button label', type: 'text', help: 'Leave empty for no button.' },
      { name: 'ctaUrl', label: 'Button links to', type: 'link' },
      {
        name: 'ctaPosition',
        label: 'Button position',
        type: 'select',
        default: 'below',
        options: [
          { value: 'below', label: 'Below the text' },
          { value: 'beside', label: 'Beside the text' },
        ],
      },
    ],
  },

  {
    name: 'pageHeader',
    label: 'Page Banner',
    description: 'Image banner with the page title. Shorter than the hero.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        name: 'image',
        label: 'Background image',
        type: 'image',
        required: true,
      },
    ],
  },

  {
    name: 'featureList',
    label: 'Feature List',
    description: 'Short numbered points in columns: principles, steps, commitments.',
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      {
        name: 'layout',
        label: 'Layout',
        type: 'select',
        default: 'band',
        options: [
          { value: 'band', label: 'Full-width band between lines' },
          { value: 'column', label: 'Compact, in the reading column' },
        ],
      },
      {
        name: 'numberPosition',
        label: 'Numbers',
        type: 'select',
        default: 'beside',
        options: [
          { value: 'beside', label: 'Beside the title' },
          { value: 'above', label: 'Above the title' },
        ],
      },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        default: '3',
        options: [
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ],
      },
      { name: 'numbered', label: 'Show numbers', type: 'boolean', default: true },
      {
        name: 'items',
        label: 'Points',
        type: 'array',
        min: 1,
        max: 8,
        titleField: 'title',
        addLabel: 'Add point',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
      },
    ],
  },

  {
    name: 'stats',
    label: 'Key Numbers',
    description: 'A row of big numbers with labels.',
    fields: [
      {
        name: 'items',
        label: 'Numbers',
        type: 'array',
        min: 1,
        max: 4,
        titleField: 'label',
        addLabel: 'Add number',
        fields: [
          { name: 'value', label: 'Number', type: 'text', required: true },
          { name: 'label', label: 'Label', type: 'text' },
        ],
      },
    ],
  },

  {
    name: 'infoRows',
    label: 'Info Table',
    description: 'Rows of a name and two details, such as delivery options.',
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      spacingField('compact'),
      {
        name: 'items',
        label: 'Rows',
        type: 'array',
        min: 1,
        max: 20,
        titleField: 'label',
        addLabel: 'Add row',
        fields: [
          { name: 'label', label: 'Name', type: 'text', required: true },
          { name: 'value', label: 'Detail', type: 'text' },
          { name: 'note', label: 'Second detail', type: 'text', help: 'Shown on the right.' },
        ],
      },
    ],
  },

  {
    name: 'faq',
    label: 'FAQ',
    description: 'Questions that open to show their answer, in groups.',
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      spacingField('compact'),
      {
        name: 'items',
        label: 'Questions',
        type: 'array',
        min: 1,
        max: 60,
        titleField: 'question',
        addLabel: 'Add question',
        fields: [
          {
            name: 'group',
            label: 'Group',
            type: 'text',
            help: 'Questions in a row with the same group are shown under one heading.',
          },
          { name: 'question', label: 'Question', type: 'text', required: true },
          { name: 'answer', label: 'Answer', type: 'textarea', required: true },
        ],
      },
    ],
  },

  {
    name: 'cardGrid',
    label: 'Card Grid',
    description: 'Image cards with a title and text: stores, stories, team.',
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      spacingField(),
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        default: '3',
        options: [
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ],
      },
      {
        name: 'imageShape',
        label: 'Image shape',
        type: 'select',
        default: 'classic',
        options: [
          { value: 'classic', label: 'Classic (4:3)' },
          { value: 'wide', label: 'Wide (16:10)' },
        ],
      },
      {
        name: 'items',
        label: 'Cards',
        type: 'array',
        min: 1,
        max: 12,
        titleField: 'title',
        addLabel: 'Add card',
        fields: [
          { name: 'image', label: 'Image', type: 'image', required: true },
          { name: 'eyebrow', label: 'Small line above the title', type: 'text', help: 'A category, for example.' },
          { name: 'date', label: 'Date', type: 'text', help: 'Shown after the small line, with a dot between them.' },
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'footnote', label: 'Small line below the text', type: 'text' },
          { name: 'link', label: 'Links to', type: 'link', help: 'Leave empty for a card that is not a link.' },
        ],
      },
    ],
  },

  {
    name: 'contactForm',
    label: 'Contact Form',
    description: 'Your contact details next to a message form. Messages go to Odoo.',
    dynamic: true,
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      spacingField(),
      {
        name: 'channels',
        label: 'Contact details',
        type: 'array',
        max: 6,
        titleField: 'label',
        addLabel: 'Add contact detail',
        fields: [
          { name: 'label', label: 'Label', type: 'text', required: true },
          { name: 'value', label: 'Shown as', type: 'text', required: true },
          { name: 'link', label: 'Links to', type: 'link', help: 'mailto:, tel: or a web address.' },
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
      { name: 'title', label: 'Heading', type: 'text' },
      {
        name: 'body',
        label: 'Body copy',
        type: 'textarea',
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
      if (typeof value === 'string' && value.trim()) continue

      out[field.name] = field.label
    }

    return out
  }

  return fill(schema.fields, resolved)
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
