// This storefront's block catalogue: which blocks a merchant can place, and
// what fields each one has. The CMS engine (layers/cms) reads it through the
// `#cms-blocks/schemas` alias and knows no block by name.
//
// Pure data, with NO Vue imports: the Nitro API validates every write against
// these schemas, so they must load without a component tree. Which component
// renders each block is declared next door, in `components.ts`.

import type { BlockMigration, BlockSchema, SelectField } from '#cms/shared/types'

// Every block below renders through a component that ALREADY EXISTS on the
// storefront - layers/core, or this layer's own components. None of them are
// CMS-specific re-implementations: that is the guarantee that the editor canvas
// and the production page are the same pixels.

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
          { name: 'label', label: 'Label', type: 'text', required: true, noPlaceholder: true },
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
      { name: 'linkLabel', label: 'Corner link label', type: 'text', noPlaceholder: true },
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
      { name: 'linkLabel', label: 'Corner link label', type: 'text', noPlaceholder: true },
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
      { name: 'ctaLabel', label: 'Button label', type: 'text', noPlaceholder: true },
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
      { name: 'ctaLabel', label: 'Button label', type: 'text', noPlaceholder: true, help: 'Leave empty for no button.' },
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

// ---------------------------------------------------------------------------
// Schema migrations
// ---------------------------------------------------------------------------
// How a block whose fields changed shape upgrades content written against an
// older version. The engine runs these on read (see migrateBlock in
// layers/cms/shared/blocks.ts); a block bumps `version` above and adds a step
// here.

/**
 * Keyed by block type, then by the version being migrated FROM.
 *
 * `{ hero: { 1: fn } }` means "a hero at version 1 becomes version 2 by
 * running fn". Chains apply in order until the block reaches current.
 */
export const blockMigrations: Record<string, Record<number, BlockMigration>> = {
  // Example of the shape, kept deliberately:
  //
  // hero: {
  //   1: data => {
  //     const { body, ...rest } = data
  //     return { ...rest, subtitle: body }
  //   },
  // },
}
