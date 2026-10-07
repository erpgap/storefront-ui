import { describe, expect, it } from 'vitest'
import {
  blockSchemas,
  currentSchemaVersion,
  defaultsFor,
  getBlockSchema,
  isTranslatable,
  migrateBlock,
  outdatedBlockCount,
  resolveBlockData,
  seedBlockData,
  untranslatedFields,
  validateBlocks,
  placeholderLabels,
  withFieldPlaceholders,
} from './blocks'
import type { BlockInstance, Field } from './blocks'
import { DEFAULT_LOCALE } from './i18n'

const hero = (data: Record<string, unknown>): BlockInstance =>
  ({ id: 'b1', blockType: 'hero', data })

describe('the block registry', () => {
  it('every schema has a unique name and at least one field', () => {
    const names = blockSchemas.map(s => s.name)
    expect(new Set(names).size).toBe(names.length)
    for (const schema of blockSchemas) {
      expect(schema.fields.length, schema.name).toBeGreaterThan(0)
      expect(schema.label, schema.name).toBeTruthy()
    }
  })

  it('every field name is unique within its block', () => {
    for (const schema of blockSchemas) {
      const names = schema.fields.map(f => f.name)
      expect(new Set(names).size, schema.name).toBe(names.length)
    }
  })

  it('every select field has options and a default among them', () => {
    for (const schema of blockSchemas) {
      for (const field of schema.fields) {
        if (field.type !== 'select') continue
        expect(field.options.length, `${schema.name}.${field.name}`).toBeGreaterThan(0)
        if (field.default !== undefined) {
          expect(
            field.options.map(o => o.value),
            `${schema.name}.${field.name}`,
          ).toContain(field.default)
        }
      }
    }
  })

  it('seeds every block type with the shape its fields declare', () => {
    // A select wrapped as a per-language map is unreadable to the component,
    // which is exactly what a fall-through branch once produced.
    const walk = (fields: Field[], data: Record<string, unknown>, path: string) => {
      for (const field of fields) {
        const value = data[field.name]
        if (field.type === 'array') {
          expect(Array.isArray(value), `${path}.${field.name}`).toBe(true)
          for (const row of value as Record<string, unknown>[]) {
            walk(field.fields, row, `${path}.${field.name}[]`)
          }
          continue
        }
        if (field.type === 'product-ref' || field.type === 'category-ref') {
          expect(value, `${path}.${field.name}`).toEqual([])
          continue
        }
        const isMap = Boolean(value) && typeof value === 'object'
        expect(isMap, `${path}.${field.name} (${field.type})`).toBe(isTranslatable(field))
      }
    }

    for (const schema of blockSchemas) {
      walk(schema.fields, seedBlockData(schema.name), schema.name)
    }
  })

  it('seeds exactly the declared minimum number of array rows', () => {
    // Forcing a row into an array with no minimum meant a brand-new page
    // arrived already failing validation.
    const heroSchema = getBlockSchema('hero')!
    const ctas = heroSchema.fields.find(f => f.name === 'ctas')!
    expect(ctas.type).toBe('array')
    expect(seedBlockData('hero').ctas).toEqual([])

    const valueProps = getBlockSchema('valueProps')!
    const items = valueProps.fields.find(f => f.name === 'items')! as any
    expect(items.min).toBe(1)
    expect((seedBlockData('valueProps').items as unknown[]).length).toBe(1)
  })

  it('returns nothing for an unknown block type', () => {
    expect(getBlockSchema('nope')).toBeUndefined()
    expect(seedBlockData('nope')).toEqual({})
  })
})

describe('validateBlocks', () => {
  it('drops unknown block types and reports them', () => {
    const { blocks, issues } = validateBlocks([
      hero({ title: { en_US: 'ok' }, image: { en_US: '/i.webp' } }),
      { id: 'b2', blockType: 'notARealBlock', data: {} },
    ])
    expect(blocks).toHaveLength(1)
    expect(issues.some(i => /Unknown block type/.test(i.message))).toBe(true)
  })

  it('strips keys that are not in the schema', () => {
    // Iterating the schema rather than the input is what makes this true, and
    // it is why a client cannot invent a prop.
    const { blocks } = validateBlocks([
      hero({ title: { en_US: 'ok' }, image: { en_US: '/i' }, evil: '<script>' }),
    ])
    expect(blocks[0]!.data).not.toHaveProperty('evil')
  })

  it('rejects non-list input', () => {
    const { blocks, issues } = validateBlocks({ not: 'a list' })
    expect(blocks).toEqual([])
    expect(issues).toHaveLength(1)
  })

  it('gives a block an id when it has none', () => {
    const { blocks } = validateBlocks([
      { blockType: 'hero', data: {} } as unknown as BlockInstance,
    ])
    expect(blocks[0]!.id).toBeTruthy()
  })

  it('stamps the current schema version on write', () => {
    const { blocks } = validateBlocks([hero({ title: { en_US: 'ok' } })])
    expect(blocks[0]!.schemaVersion).toBe(currentSchemaVersion('hero'))
  })

  describe('link fields', () => {
    it('rejects javascript: urls per language', () => {
      const { blocks, issues } = validateBlocks([{
        id: 'b1',
        blockType: 'hero',
        data: {
          title: { en_US: 'ok' },
          image: { en_US: '/i' },
          ctas: [{ label: { en_US: 'Go' }, url: { en_US: 'javascript:alert(1)' }, style: 'primary' }],
        },
      }])
      expect((blocks[0]!.data.ctas as any)[0].url.en_US).toBe('')
      expect(issues.some(i => i.path.endsWith('.en_US'))).toBe(true)
    })

    it('accepts paths, absolute urls, mailto and tel', () => {
      for (const url of ['/products', 'https://example.com', 'mailto:a@b.c', 'tel:+351']) {
        const { issues } = validateBlocks([{
          id: 'b1',
          blockType: 'hero',
          data: {
            title: { en_US: 'ok' },
            image: { en_US: '/i' },
            ctas: [{ label: { en_US: 'Go' }, url: { en_US: url }, style: 'primary' }],
          },
        }])
        expect(issues.filter(i => i.path.includes('url')), url).toHaveLength(0)
      }
    })
  })

  describe('select fields', () => {
    it('clamps an unknown option to the default', () => {
      const { blocks, issues } = validateBlocks([{
        id: 'b1',
        blockType: 'hero',
        data: {
          title: { en_US: 'ok' },
          image: { en_US: '/i' },
          ctas: [{ label: { en_US: 'Go' }, url: { en_US: '/p' }, style: 'neon' }],
        },
      }])
      expect((blocks[0]!.data.ctas as any)[0].style).toBe('primary')
      expect(issues.some(i => /must be one of/.test(i.message))).toBe(true)
    })
  })

  describe('number fields', () => {
    it('clamps to the declared range', () => {
      const big = validateBlocks([{
        id: 'b', blockType: 'bestSellers', data: { pageSize: 999 },
      }]).blocks[0]!
      expect(big.data.pageSize).toBe(12)

      const small = validateBlocks([{
        id: 'b', blockType: 'bestSellers', data: { pageSize: -4 },
      }]).blocks[0]!
      expect(small.data.pageSize).toBe(2)
    })

    it('reports a value that is not a number', () => {
      const { issues } = validateBlocks([{
        id: 'b', blockType: 'bestSellers', data: { pageSize: 'lots' },
      }])
      expect(issues.some(i => /must be a number/.test(i.message))).toBe(true)
    })
  })

  describe('required fields', () => {
    it('is enforced against the default language only', () => {
      // Blocking a publish because Portuguese is unfinished would make
      // translation a gate on shipping English, which is backwards.
      const { issues } = validateBlocks([
        hero({ title: { en_US: 'Has English', pt_PT: '' }, image: { en_US: '/i' } }),
      ])
      expect(issues.filter(i => i.path.endsWith('title'))).toHaveLength(0)
    })

    it('fires when the default language is empty', () => {
      const { issues } = validateBlocks([
        hero({ title: { en_US: '', pt_PT: 'So portugues' }, image: { en_US: '/i' } }),
      ])
      expect(issues.some(i => i.path.endsWith('title'))).toBe(true)
    })

    it('is satisfied by a region variant', () => {
      // Otherwise installing a regional language makes every existing page
      // fail to publish.
      const { issues } = validateBlocks([
        hero({ title: { en: 'Written as plain en' }, image: { en: '/i' } }),
      ])
      expect(issues.filter(i => i.path.endsWith('title'))).toHaveLength(0)
    })
  })

  describe('arrays', () => {
    it('enforces the maximum and reports it', () => {
      const rows = Array.from({ length: 5 }, (_, i) => ({
        label: { en_US: `b${i}` }, url: { en_US: '/p' }, style: 'primary',
      }))
      const { blocks, issues } = validateBlocks([
        hero({ title: { en_US: 'ok' }, image: { en_US: '/i' }, ctas: rows }),
      ])
      expect((blocks[0]!.data.ctas as unknown[]).length).toBe(2)
      expect(issues.some(i => /at most/.test(i.message))).toBe(true)
    })

    it('coerces a non-list to empty', () => {
      const { blocks } = validateBlocks([
        hero({ title: { en_US: 'ok' }, image: { en_US: '/i' }, ctas: 'nope' }),
      ])
      expect(blocks[0]!.data.ctas).toEqual([])
    })
  })

  describe('reference fields', () => {
    it('keeps only positive integers', () => {
      const { blocks } = validateBlocks([{
        id: 'b', blockType: 'featuredProducts',
        data: { title: { en_US: 'x' }, productIds: [3, '7', 'bad', -1, 0, 9.5, 9] },
      }])
      expect(blocks[0]!.data.productIds).toEqual([3, 7, 9])
    })

    it('enforces the maximum', () => {
      const { blocks, issues } = validateBlocks([{
        id: 'b', blockType: 'featuredProducts',
        data: { title: { en_US: 'x' }, productIds: Array.from({ length: 12 }, (_, i) => i + 1) },
      }])
      expect((blocks[0]!.data.productIds as unknown[]).length).toBe(8)
      expect(issues.some(i => /at most/.test(i.message))).toBe(true)
    })

    it('reports an empty required selection', () => {
      const { issues } = validateBlocks([{
        id: 'b', blockType: 'featuredProducts',
        data: { title: { en_US: 'x' }, productIds: [] },
      }])
      expect(issues.some(i => i.path.endsWith('productIds'))).toBe(true)
    })
  })
})

describe('resolveBlockData', () => {
  it('flattens per-language values to plain props', () => {
    // The seam that keeps the storage shape invisible to components.
    const resolved = resolveBlockData('hero', {
      title: { en_US: 'Summer', pt_PT: 'Verao' },
      image: { en_US: '/hero.webp' },
    }, 'pt_PT')

    expect(resolved.title).toBe('Verao')
    expect(resolved.image).toBe('/hero.webp')
  })

  it('leaves non-translatable values alone', () => {
    const resolved = resolveBlockData('bestSellers', { pageSize: 6, sort: 'newest' }, 'pt_PT')
    expect(resolved.pageSize).toBe(6)
    expect(resolved.sort).toBe('newest')
  })

  it('resolves inside array rows', () => {
    const resolved = resolveBlockData('hero', {
      ctas: [{ label: { en_US: 'Shop', pt_PT: 'Comprar' }, url: { en_US: '/p' }, style: 'primary' }],
    }, 'pt_PT')
    expect((resolved.ctas as any)[0].label).toBe('Comprar')
    expect((resolved.ctas as any)[0].style).toBe('primary')
  })

  it('returns nothing for an unknown block type', () => {
    expect(resolveBlockData('nope', { a: 1 }, DEFAULT_LOCALE)).toEqual({})
  })
})

describe('untranslatedFields', () => {
  const data = {
    title: { en_US: 'Summer' },
    body: { en_US: 'Copy', pt_PT: 'Texto' },
    image: { en_US: '/hero.webp' },
  }

  it('counts only prose that has source content and no translation', () => {
    expect(untranslatedFields('hero', data, 'pt_PT')).toBe(1)
  })

  it('counts nothing in the default language', () => {
    expect(untranslatedFields('hero', data, DEFAULT_LOCALE)).toBe(0)
  })

  it('does not count images or links, which inherit correctly', () => {
    const withLink = {
      title: { en_US: 'T', pt_PT: 'T' },
      image: { en_US: '/i.webp' },
      ctas: [{ label: { en_US: 'Go', pt_PT: 'Ir' }, url: { en_US: '/p' }, style: 'primary' }],
    }
    expect(untranslatedFields('hero', withLink, 'pt_PT')).toBe(0)
  })

  it('does not count empty optional fields as outstanding work', () => {
    expect(untranslatedFields('hero', { title: { en_US: 'T', pt_PT: 'T' } }, 'pt_PT')).toBe(0)
  })
})

describe('schema migrations', () => {
  it('treats a block with no version as version 1', () => {
    const migrated = migrateBlock(hero({ title: { en_US: 'x' } }))
    expect(migrated.schemaVersion).toBe(1)
  })

  it('leaves a current block untouched', () => {
    const block = { ...hero({ title: { en_US: 'x' } }), schemaVersion: currentSchemaVersion('hero') }
    expect(migrateBlock(block)).toEqual(block)
  })

  it('reports how much content is behind', () => {
    expect(outdatedBlockCount([hero({})])).toBe(0)
  })

  it('does not invent a version for an unknown block type', () => {
    expect(currentSchemaVersion('nope')).toBe(1)
  })
})

describe('defaultsFor', () => {
  it('builds a value for every declared field and nothing else', () => {
    const fields = getBlockSchema('richText')!.fields
    const defaults = defaultsFor(fields)
    expect(Object.keys(defaults).sort()).toEqual(fields.map(f => f.name).sort())
  })
})

describe('withFieldPlaceholders', () => {
  it('stands in for empty text with the field label', () => {
    const out = withFieldPlaceholders('categories', { title: '', eyebrow: '' })

    expect(out.title).toBe('Heading')
    expect(out.eyebrow).toBe('Eyebrow')
  })

  it('leaves text the merchant actually wrote alone', () => {
    const out = withFieldPlaceholders('categories', { title: 'Our ranges', eyebrow: '' })

    expect(out.title).toBe('Our ranges')
  })

  it('treats whitespace as empty, because it renders as nothing', () => {
    expect(withFieldPlaceholders('categories', { title: '   ' }).title).toBe('Heading')
  })

  it('does not invent a link, whose value is a destination', () => {
    const out = withFieldPlaceholders('categories', { linkUrl: '' })

    expect(out.linkUrl).toBe('')
  })

  it('reaches text inside array rows', () => {
    const out = withFieldPlaceholders('faq', {
      items: [{ question: '', answer: 'Yes.' }],
    })

    const rows = out.items as Record<string, unknown>[]
    expect(rows[0]!.question).toBe('Question')
    expect(rows[0]!.answer).toBe('Yes.')
  })

  it('leaves a button label alone, where empty means no button', () => {
    const out = withFieldPlaceholders('editorial', { ctaLabel: '', title: '' })

    // A heading is text that is missing; a button label is a button that does
    // not exist. Faking the second one draws a control nobody asked for.
    expect(out.ctaLabel).toBe('')
    expect(out.title).toBe('Heading')
  })

  it('is a no-op for a block type it does not know', () => {
    expect(withFieldPlaceholders('nope', { title: '' })).toEqual({ title: '' })
  })
})

describe('placeholderLabels', () => {
  it('lists the text labels the canvas can show', () => {
    expect(placeholderLabels('categories')).toContain('Heading')
  })

  it('omits labels that would draw a control', () => {
    expect(placeholderLabels('editorial')).not.toContain('Button label')
  })
})
