import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  hasValueFor,
  hasTranslation,
  isLocaleCode,
  resolveValue,
  setValue,
  toMap,
} from './i18n'

describe('locale codes', () => {
  it('accepts plain and regional codes', () => {
    for (const code of ['en', 'pt', 'en_US', 'pt_BR', 'fil']) {
      expect(isLocaleCode(code), code).toBe(true)
    }
  })

  it('rejects anything that is not a locale', () => {
    // The check exists to stop arbitrary keys being smuggled through a JSON
    // column Odoo treats as opaque.
    for (const code of ['', 'x', 'EN', 'en-US', 'en_us', '__proto__', 'a'.repeat(40)]) {
      expect(isLocaleCode(code), code).toBe(false)
    }
  })
})

describe('resolveValue', () => {
  it('returns the exact language when present', () => {
    expect(resolveValue({ en_US: 'Hello', pt_PT: 'Ola' }, 'pt_PT')).toBe('Ola')
  })

  it('falls back to the default language', () => {
    expect(resolveValue({ en_US: 'Hello' }, 'pt_PT')).toBe('Hello')
  })

  it('tolerates region variants in both directions', () => {
    // Content written as `en` must still serve `en_US`, or installing a
    // regional language in Odoo silently orphans everything already written.
    expect(resolveValue({ en: 'Hello' }, 'en_US')).toBe('Hello')
    expect(resolveValue({ en_US: 'Hello' }, 'en')).toBe('Hello')
    expect(resolveValue({ pt_BR: 'Oi' }, 'pt_PT')).toBe('Oi')
  })

  it('prefers the requested language over the default', () => {
    expect(resolveValue({ en_US: 'Hello', pt_PT: 'Ola' }, 'pt')).toBe('Ola')
  })

  it('treats an empty string as untranslated, not as deliberately blank', () => {
    expect(resolveValue({ en_US: 'Hello', pt_PT: '   ' }, 'pt_PT')).toBe('Hello')
  })

  it('reads a bare string as default-language content', () => {
    // How everything written before multi-language existed is stored.
    expect(resolveValue('Legacy copy', 'pt_PT')).toBe('Legacy copy')
  })

  it('returns empty for missing or malformed values', () => {
    expect(resolveValue(undefined, 'en_US')).toBe('')
    expect(resolveValue(null, 'en_US')).toBe('')
    expect(resolveValue(42, 'en_US')).toBe('')
    expect(resolveValue({}, 'en_US')).toBe('')
  })
})

describe('setValue', () => {
  it('writes one language without disturbing the others', () => {
    const result = setValue({ en_US: 'Hello', pt_PT: 'Ola' }, 'pt_PT', 'Olá')
    expect(result).toEqual({ en_US: 'Hello', pt_PT: 'Olá' })
  })

  it('normalises legacy bare strings into the default language', () => {
    expect(setValue('Legacy', 'pt_PT', 'Novo')).toEqual({
      [DEFAULT_LOCALE]: 'Legacy',
      pt_PT: 'Novo',
    })
  })

  it('starts a map from nothing', () => {
    expect(setValue(undefined, 'en_US', 'Hi')).toEqual({ en_US: 'Hi' })
  })
})

describe('toMap', () => {
  it('drops keys that are not shaped like language codes', () => {
    expect(toMap({
      'en_US': 'ok',
      'not a locale': 'bad',
      '__proto__': 'bad',
      'en-US': 'bad',
    })).toEqual({ en_US: 'ok' })
  })

  it('keeps well-formed codes it has never heard of', () => {
    // Deliberate. Validating shape rather than membership of a list is what
    // stops a language installed in Odoo from being silently discarded
    // because the storefront had not been rebuilt to know about it. The cost
    // is that an unused-but-well-formed code survives, which is harmless.
    expect(toMap({ zu_ZA: 'sawubona' })).toEqual({ zu_ZA: 'sawubona' })
  })

  it('drops non-string values', () => {
    expect(toMap({ en_US: 'ok', pt_PT: 42 })).toEqual({ en_US: 'ok' })
  })

  it('wraps a bare string', () => {
    expect(toMap('Legacy')).toEqual({ [DEFAULT_LOCALE]: 'Legacy' })
  })
})

describe('translation state', () => {
  it('reports the default language as always translated', () => {
    expect(hasTranslation({ en_US: 'Hello' }, DEFAULT_LOCALE)).toBe(true)
  })

  it('reports a missing or blank translation', () => {
    expect(hasTranslation({ en_US: 'Hello' }, 'pt_PT')).toBe(false)
    expect(hasTranslation({ en_US: 'Hello', pt_PT: '  ' }, 'pt_PT')).toBe(false)
  })

  it('hasValueFor accepts a region variant', () => {
    expect(hasValueFor({ en: 'Hello' }, 'en_US')).toBe(true)
    expect(hasValueFor({ de: 'Hallo' }, 'en_US')).toBe(false)
  })
})
