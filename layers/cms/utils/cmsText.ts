// The editor's words for the block catalogue and for what the CMS API says,
// in the editor's language.
//
// The schemas stay plain English data: the Nitro API validates every write
// against them and must load them without vue-i18n. So their translations live
// in the locale files under keys that follow the schema's shape, and every
// lookup here falls back to the schema's own English when a key is missing - a
// block added later without translations still shows its label.
//
//   cmsBlocks.<block>.label | description
//   cmsBlocks.<block>.fields.<field>.label | help | addLabel
//   cmsBlocks.<block>.fields.<field>.options.<value>
//   cmsBlocks.<block>.fields.<array>.fields.<field>...   a row's fields
//   cmsBlockFields.<textKey>...                          a field blocks share
//   cmsEditor.issues.<code>                              a validation issue
//   cmsEditor.errors.*                                   an API error's `data.messageKey`
//
// Takes `t` and `te` rather than calling useI18n, so it can be tested against
// the real en.json without a Nuxt app. Components use it through useCmsText.

import { getBlockSchema } from '#cms/shared/blocks'
import type { Field, FieldLabel, ValidationIssue } from '#cms/shared/blocks'

export interface CmsTranslator {
  t: (key: string, params?: Record<string, unknown>) => string
  te: (key: string) => boolean
}

/** Schema text a field can carry. */
export type FieldTextKind = 'label' | 'help' | 'addLabel'

/**
 * A field path as the editor writes it - `ctas[0].label` - or as names,
 * `['ctas', 'label']`. Row indexes say which row, not which field, so they go.
 */
function namesOf(path: string | string[]): string[] {
  return Array.isArray(path) ? path : path.replace(/\[\d+\]/g, '').split('.')
}

/**
 * The field a path inside a block points at, and its names from the block
 * down. A validation path can end in a language (`ctas[0].url.en_US`), which
 * is past the last field and ignored.
 */
export function cmsFieldAt(
  blockType: string,
  path: string | string[],
): { field: Field, names: string[] } | undefined {
  let fields: Field[] | undefined = getBlockSchema(blockType)?.fields
  let found: Field | undefined
  const names: string[] = []

  for (const name of namesOf(path)) {
    if (!fields) break
    found = fields.find(field => field.name === name)
    if (!found) return undefined
    names.push(name)
    fields = found.type === 'array' ? found.fields : undefined
  }

  return found ? { field: found, names } : undefined
}

/** Where a field's text lives: its own block's subtree, or the shared one. */
export function cmsFieldKey(blockType: string, field: Field, path: string | string[]): string {
  if (field.textKey) return `cmsBlockFields.${field.textKey}`
  return `cmsBlocks.${blockType}.${namesOf(path).map(name => `fields.${name}`).join('.')}`
}

export function createCmsText({ t, te }: CmsTranslator) {
  const translated = (key: string, english: string) => (te(key) ? t(key) : english)

  function blockLabel(blockType: string): string {
    const schema = getBlockSchema(blockType)
    return schema ? translated(`cmsBlocks.${blockType}.label`, schema.label) : blockType
  }

  function blockDescription(blockType: string): string {
    const schema = getBlockSchema(blockType)
    return schema ? translated(`cmsBlocks.${blockType}.description`, schema.description) : ''
  }

  /**
   * A field's label, help or "add row" text. Undefined when the schema has
   * none, except a label, which falls back to the field's name as the
   * inspector always did.
   */
  function fieldText(blockType: string, field: Field, path: string | string[], kind: 'label'): string
  function fieldText(blockType: string, field: Field, path: string | string[], kind: FieldTextKind): string | undefined
  function fieldText(blockType: string, field: Field, path: string | string[], kind: FieldTextKind) {
    const english = kind === 'addLabel'
      ? (field.type === 'array' ? field.addLabel : undefined)
      : field[kind]

    if (english === undefined) return kind === 'label' ? field.name : undefined
    return translated(`${cmsFieldKey(blockType, field, path)}.${kind}`, english)
  }

  function optionLabel(
    blockType: string,
    field: Field,
    path: string | string[],
    option: { value: string, label: string },
  ): string {
    return translated(`${cmsFieldKey(blockType, field, path)}.options.${option.value}`, option.label)
  }

  /** For withFieldPlaceholders and placeholderLabels: the canvas's stand-in text. */
  function canvasLabel(blockType: string): FieldLabel {
    return (field, path) => fieldText(blockType, field, path, 'label')
  }

  /**
   * A validation issue in the editor's language, naming the field by its
   * translated label. `blockType` is the type of the block the issue's path
   * points into. Falls back to the server's English.
   */
  function issueMessage(issue: ValidationIssue, blockType?: string): string {
    const key = `cmsEditor.issues.${issue.code}`
    if (!issue.code || !te(key)) return issue.message

    const params: Record<string, unknown> = { ...issue.params }
    const located = blockType
      ? cmsFieldAt(blockType, issue.path.replace(/^blocks\[\d+\]\.?/, ''))
      : undefined
    if (located && params.label !== undefined) {
      params.label = fieldText(blockType!, located.field, located.names, 'label')
    }

    return t(key, params)
  }

  /**
   * What to tell the editor about a failed API call: the translation the
   * server named in `data.messageKey`, else its English statusMessage, else
   * the caller's fallback.
   *
   * h3 sends createError's `data` as the `data` of the JSON error body, and
   * ofetch puts that body on the error's own `data` - hence `data.data`.
   */
  function errorMessage(error: any, fallback: string): string {
    const data = error?.data?.data
    const key = data?.messageKey
    if (typeof key === 'string' && te(key)) return t(key, data.params ?? {})
    return error?.data?.statusMessage || error?.statusMessage || fallback
  }

  return { blockLabel, blockDescription, fieldText, optionLabel, canvasLabel, issueMessage, errorMessage }
}
