import { describe, expect, it } from 'vitest'
import { parseInline, parseRichText } from './richText'

describe('parseRichText', () => {
  it('splits paragraphs on blank lines and joins wrapped lines', () => {
    expect(parseRichText('One\nline\n\nTwo')).toEqual([
      { kind: 'p', parts: [{ text: 'One line' }] },
      { kind: 'p', parts: [{ text: 'Two' }] },
    ])
  })

  it('turns a block of "- " lines into a list', () => {
    expect(parseRichText('- a\n- b')).toEqual([
      { kind: 'ul', items: [[{ text: 'a' }], [{ text: 'b' }]] },
    ])
  })

  it('keeps a mixed block as a paragraph', () => {
    expect(parseRichText('- a\nb')[0]!.kind).toBe('p')
  })
})

describe('parseInline', () => {
  it('makes links of safe targets', () => {
    expect(parseInline('See [FAQ](/faq) or [mail](mailto:a@b.c).')).toEqual([
      { text: 'See ' },
      { text: 'FAQ', href: '/faq' },
      { text: ' or ' },
      { text: 'mail', href: 'mailto:a@b.c' },
      { text: '.' },
    ])
  })

  it('keeps the label but drops an unsafe target', () => {
    expect(parseInline('[click](javascript:alert(1))')).toEqual([
      { text: 'click' },
      { text: ')' },
    ])
  })
})
