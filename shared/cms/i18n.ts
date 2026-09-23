// Multi-language CMS content.
//
// Storage shape (docs/CMS_ODOO_SPEC.md §11, option 1): a translatable field
// holds one value per language.
//
//   { "title": { "en": "Summer Sale", "pt": "Saldos de Verão" } }
//
// The merchant NEVER sees this. They see the same inspector with a language
// picker in the top bar. Storage format and editing interface are different
// things — a page is already stored as JSON today and nobody types a brace.
//
// Why per-field values rather than a separate set of blocks per language:
//
//   - It degrades. A missing Portuguese headline falls back to English and the
//     page still renders. Per-language blocks mean an unfilled language has no
//     page at all.
//   - It does not tax single-language merchants, who get one key and no
//     visible change.
//   - "3 fields not yet translated" and a machine-translate button are only
//     possible when source and target sit side by side.
//   - A merchant wanting a genuinely DIFFERENT page per market just creates
//     another page. That needs no schema feature.

export interface CmsLocale {
  code: string
  label: string
}

/**
 * PoC only. In the real implementation this comes from Odoo's active languages
 * (`res.lang`), NOT from the Nuxt i18n config — a merchant may sell in five
 * languages while the storefront ships UI translations for three. Content
 * languages and interface languages are different lists.
 */
export const CMS_LOCALES: CmsLocale[] = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
]

export const DEFAULT_LOCALE = 'en'

export const LOCALE_CODES = CMS_LOCALES.map(locale => locale.code)

export function localeLabel(code: string): string {
  return CMS_LOCALES.find(locale => locale.code === code)?.label ?? code
}

/**
 * A translatable value is a per-language map — or a bare string, which is how
 * content written before this feature existed is stored.
 *
 * Accepting both is a deliberate lazy migration: old content keeps rendering
 * untouched and is normalised the next time it is saved. This is the same
 * pattern §4 of the spec prescribes for block schema versions, in miniature.
 */
export type Translatable = string | Record<string, string>

/** Reads the value for `locale`, falling back to the default language. */
export function resolveValue(
  raw: unknown,
  locale: string,
  fallback: string = DEFAULT_LOCALE,
): string {
  if (typeof raw === 'string') return raw
  if (!raw || typeof raw !== 'object') return ''

  const map = raw as Record<string, string>
  const wanted = map[locale]
  if (typeof wanted === 'string' && wanted.trim()) return wanted

  // Empty string in the requested language is treated as "not translated yet"
  // rather than "deliberately blank" — a merchant clearing a field to blank it
  // is vanishingly rare next to one who simply has not got to it.
  const base = map[fallback]
  return typeof base === 'string' ? base : ''
}

/** Writes one language's value, preserving the others. */
export function setValue(
  raw: unknown,
  locale: string,
  value: string,
): Record<string, string> {
  const base: Record<string, string>
    = typeof raw === 'string'
      // Normalising legacy content on write: the bare string was always the
      // default language.
      ? { [DEFAULT_LOCALE]: raw }
      : { ...(raw as Record<string, string> | null ?? {}) }

  base[locale] = value
  return base
}

/** Has this field been given a value in `locale`? */
export function hasTranslation(raw: unknown, locale: string): boolean {
  if (locale === DEFAULT_LOCALE) return true
  if (typeof raw === 'string') return false
  if (!raw || typeof raw !== 'object') return false

  const value = (raw as Record<string, string>)[locale]
  return typeof value === 'string' && value.trim().length > 0
}

/** Normalises any accepted shape to a per-language map. */
export function toMap(raw: unknown): Record<string, string> {
  if (typeof raw === 'string') return { [DEFAULT_LOCALE]: raw }
  if (!raw || typeof raw !== 'object') return { [DEFAULT_LOCALE]: '' }

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      // Only known languages survive: the value map's keys come from the
      // client, so an unknown key is either a bug or an attempt to smuggle
      // data through an opaque JSON column.
      .filter(([code, value]) => LOCALE_CODES.includes(code) && typeof value === 'string')
      .map(([code, value]) => [code, value as string]),
  )
}
