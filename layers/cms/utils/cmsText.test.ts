import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { blockSchemas, validateBlocks } from '#cms/shared/blocks'
import type { Field, ValidationIssue } from '#cms/shared/blocks'
import { DEFAULT_LOCALE } from '#cms/shared/i18n'
import en from '~~/i18n/locales/en.json'
import { cmsFieldKey, createCmsText } from './cmsText'
import type { CmsTranslator } from './cmsText'

// The real vue-i18n, so the messages are compiled exactly as the app compiles
// them: escapes like {'|'} and placeholders included. It is not a direct
// dependency, so it is found next to @nuxtjs/i18n, which brings it.
const require = createRequire(import.meta.url)
const { createI18n } = createRequire(require.resolve('@nuxtjs/i18n'))('vue-i18n')

function translator(messages: Record<string, unknown> = { en }, locale = 'en'): CmsTranslator {
  const i18n = createI18n({ legacy: false, locale, messages, missingWarn: false, fallbackWarn: false })
  return {
    t: (key, params) => i18n.global.t(key, params ?? {}),
    te: key => i18n.global.te(key),
  }
}

/** Every leaf key under a subtree of en.json. */
function leafKeys(tree: unknown, prefix: string): string[] {
  if (typeof tree === 'string') return [prefix]
  return Object.entries(tree as Record<string, unknown>)
    .flatMap(([key, value]) => leafKeys(value, `${prefix}.${key}`))
}

describe('the block registry text in en.json', () => {
  const i18n = translator()
  const text = createCmsText(i18n)

  /** Every string the schemas declare: its key, its English, and what the helper renders for it. */
  function schemaStrings() {
    const strings: { key: string, english: string, rendered: string | undefined }[] = []

    const walk = (blockType: string, fields: Field[], parent: string[]) => {
      for (const field of fields) {
        const path = [...parent, field.name]
        const base = cmsFieldKey(blockType, field, path)

        if (field.label !== undefined) {
          strings.push({ key: `${base}.label`, english: field.label, rendered: text.fieldText(blockType, field, path, 'label') })
        }
        if (field.help !== undefined) {
          strings.push({ key: `${base}.help`, english: field.help, rendered: text.fieldText(blockType, field, path, 'help') })
        }
        if (field.type === 'select') {
          for (const option of field.options) {
            strings.push({ key: `${base}.options.${option.value}`, english: option.label, rendered: text.optionLabel(blockType, field, path, option) })
          }
        }
        if (field.type === 'array') {
          if (field.addLabel !== undefined) {
            strings.push({ key: `${base}.addLabel`, english: field.addLabel, rendered: text.fieldText(blockType, field, path, 'addLabel') })
          }
          walk(blockType, field.fields, path)
        }
      }
    }

    for (const schema of blockSchemas) {
      strings.push({ key: `cmsBlocks.${schema.name}.label`, english: schema.label, rendered: text.blockLabel(schema.name) })
      strings.push({ key: `cmsBlocks.${schema.name}.description`, english: schema.description, rendered: text.blockDescription(schema.name) })
      walk(schema.name, schema.fields, [])
    }
    return strings
  }

  // Asserting `te` as well as the text: the helper falls back to the schema's
  // English, so equal text alone would pass with every key missing.
  it('has every block, field and option string, rendering as the schema\'s English', () => {
    for (const { key, english, rendered } of schemaStrings()) {
      expect(i18n.te(key), key).toBe(true)
      expect(i18n.t(key), key).toBe(english)
      expect(rendered, key).toBe(english)
    }
  })

  it('has nothing the schemas no longer say', () => {
    const declared = new Set(schemaStrings().map(({ key }) => key))
    const keys = [
      ...leafKeys(en.cmsBlocks, 'cmsBlocks'),
      ...leafKeys(en.cmsBlockFields, 'cmsBlockFields'),
    ]
    expect(keys.filter(key => !declared.has(key))).toEqual([])
  })
})

describe('createCmsText', () => {
  const hero = blockSchemas.find(schema => schema.name === 'hero')!
  const ctas = hero.fields.find(field => field.name === 'ctas')!
  const ctaStyle = ctas.type === 'array' ? ctas.fields.find(field => field.name === 'style')! : undefined

  it('falls back to the schema\'s English when a translation is missing', () => {
    const text = createCmsText(translator({ en: {} }))
    expect(text.blockLabel('hero')).toBe('Hero Banner')
    expect(text.blockDescription('hero')).toBe(hero.description)
    expect(text.fieldText('hero', ctas, 'ctas', 'addLabel')).toBe('Add button')
    expect(text.optionLabel('hero', ctaStyle!, 'ctas[1].style', { value: 'secondary', label: 'Outline' }))
      .toBe('Outline')
    expect(text.blockLabel('noSuchBlock')).toBe('noSuchBlock')
  })

  it('finds a row field\'s text under its array, whatever the row', () => {
    const text = createCmsText(translator({
      xx: { cmsBlocks: { hero: { fields: { ctas: { fields: { style: { label: 'Estilo' } } } } } } },
    }, 'xx'))
    expect(text.fieldText('hero', ctaStyle!, 'ctas[1].style', 'label')).toBe('Estilo')
  })

  it('finds a shared field\'s text once, for every block that has it', () => {
    const text = createCmsText(translator({ xx: { cmsBlockFields: { spacing: { label: 'Espaço' } } } }, 'xx'))
    for (const schema of blockSchemas) {
      const spacing = schema.fields.find(field => field.name === 'spacing')
      if (spacing) expect(text.fieldText(schema.name, spacing, 'spacing', 'label'), schema.name).toBe('Espaço')
    }
  })

  it('gives no help or add label where the schema has none, and the name for a missing label', () => {
    const text = createCmsText(translator())
    const field: Field = { name: 'bare', type: 'text' }
    expect(text.fieldText('hero', field, 'bare', 'help')).toBeUndefined()
    expect(text.fieldText('hero', field, 'bare', 'addLabel')).toBeUndefined()
    expect(text.fieldText('hero', field, 'bare', 'label')).toBe('bare')
  })
})

describe('validation issues in the editor', () => {
  // One invalid page that produces every issue code.
  const { issues } = validateBlocks([
    { id: 'a', blockType: 'hero', data: {
      title: { [DEFAULT_LOCALE]: '' },
      ctas: [
        { label: { [DEFAULT_LOCALE]: 'Go' }, url: { [DEFAULT_LOCALE]: 'javascript:alert(1)' } },
        { label: { [DEFAULT_LOCALE]: 'B' } },
        { label: { [DEFAULT_LOCALE]: 'C' } },
      ],
    } },
    { id: 'b', blockType: 'bestSellers', data: { pageSize: 'many', sort: 'random' } },
    { id: 'c', blockType: 'featuredProducts', data: { productIds: [1, 2, 3, 4, 5, 6, 7, 8, 9] } },
    { id: 'd', blockType: 'categories', data: { items: 'not a list' } },
    { id: 'e', blockType: 'richText', data: { spacing: 'huge' } },
    { id: 'f', blockType: 'noSuchBlock', data: {} },
  ])
  const notAList = validateBlocks('nope').issues
  const all = [...issues, ...notAList]
  const blockTypes = ['hero', 'bestSellers', 'featuredProducts', 'categories', 'richText', 'noSuchBlock']
  const blockTypeOf = (issue: ValidationIssue) => {
    const match = /^blocks\[(\d+)\]/.exec(issue.path)
    return match ? blockTypes[Number(match[1])] : undefined
  }

  it('covers every code', () => {
    expect(new Set(all.map(issue => issue.code))).toEqual(new Set(Object.keys(en.cmsEditor.issues)))
  })

  it('renders each code from en.json exactly as the server\'s English message', () => {
    const text = createCmsText(translator())
    for (const issue of all) {
      expect(text.issueMessage(issue, blockTypeOf(issue)), issue.path).toBe(issue.message)
    }
  })

  it('names the field by its translated label', () => {
    const text = createCmsText(translator({
      xx: {
        cmsEditor: { issues: { required: '{label} é obrigatório.', badLink: '{label}: link inválido.' } },
        cmsBlocks: { hero: { fields: {
          title: { label: 'Título' },
          ctas: { fields: { url: { label: 'Destino' } } },
        } } },
      },
    }, 'xx'))
    const required = issues.find(issue => issue.code === 'required' && issue.path === 'blocks[0].title')!
    const badLink = issues.find(issue => issue.code === 'badLink')!
    expect(badLink.path).toBe(`blocks[0].ctas[0].url.${DEFAULT_LOCALE}`)
    expect(text.issueMessage(required, 'hero')).toBe('Título é obrigatório.')
    expect(text.issueMessage(badLink, 'hero')).toBe('Destino: link inválido.')
    // A code with no translation keeps the server's English.
    const notNumber = issues.find(issue => issue.code === 'notNumber')!
    expect(text.issueMessage(notNumber, 'bestSellers')).toBe(notNumber.message)
  })
})

describe('API errors in the editor', () => {
  const text = createCmsText(translator())

  it('prefers the key the server named, with its params', () => {
    const error = { statusMessage: 'x', data: { statusMessage: 'y', data: {
      messageKey: 'cmsEditor.errors.reservedSlug',
      params: { slug: '/cart' },
    } } }
    expect(text.errorMessage(error, 'fallback'))
      .toBe('"/cart" is used by the storefront and cannot be a content page.')
  })

  it('falls back to the statusMessage, then the caller\'s text', () => {
    const unknownKey = { data: { statusMessage: 'From the body', data: { messageKey: 'cmsEditor.errors.nope' } } }
    expect(text.errorMessage(unknownKey, 'fallback')).toBe('From the body')
    expect(text.errorMessage({ statusMessage: 'From the status line' }, 'fallback')).toBe('From the status line')
    expect(text.errorMessage(new Error('network'), 'fallback')).toBe('fallback')
  })

  it('has every message key the CMS API sends', () => {
    const root = fileURLToPath(new URL('../server', import.meta.url))
    const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : []
    })
    const keys = files(root).flatMap(file =>
      [...readFileSync(file, 'utf8').matchAll(/'(cmsEditor\.errors\.\w+)'/g)].map(match => match[1]!))

    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) expect(text.errorMessage({ data: { data: { messageKey: key } } }, ''), key).not.toBe('')
    expect(new Set(keys)).toEqual(new Set(leafKeys(en.cmsEditor.errors, 'cmsEditor.errors')))
  })
})
