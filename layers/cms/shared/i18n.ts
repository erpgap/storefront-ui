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
 * Fallback only. The real list comes from Odoo's active languages via
 * /api/cms/locales — NOT from the Nuxt i18n config, because a merchant may
 * sell in five languages while the storefront ships UI translations for three.
 * Content languages and interface languages are different lists.
 *
 * This is what the editor shows before that request returns, or if it fails.
 */
export const CMS_LOCALES: CmsLocale[] = [
  { code: 'en_US', label: 'English' },
]

export const DEFAULT_LOCALE = 'en_US'

/**
 * Validates the SHAPE of a language key rather than its membership of a list.
 *
 * The check exists to stop arbitrary keys being smuggled through a JSON column
 * Odoo treats as opaque, and a shape check does that just as well. Matching
 * against a build-time list would silently discard content in any language the
 * merchant installed in Odoo but the storefront had not been rebuilt to know
 * about — exactly the failure nobody notices until a translation goes missing.
 */
const LOCALE_PATTERN = /^[a-z]{2,3}(_[A-Z]{2})?$/

export function isLocaleCode(value: string): boolean {
  return LOCALE_PATTERN.test(value)
}

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

/**
 * Language part of a locale code: `pt_PT` -> `pt`.
 */
function language(code: string): string {
  return code.split('_')[0]!
}

/**
 * Finds the best value for `locale` in a per-language map.
 *
 * Resolution is tolerant of region variants in both directions, because the
 * exact code a value was written under is an accident of which language was
 * installed at the time. Content written as `en` must still serve a visitor
 * asking for `en_US`, and vice versa — otherwise adding a regional language in
 * Odoo silently orphans everything already written, which reads to the
 * merchant as "the CMS deleted my copy".
 *
 * Order: exact code, then any variant of the same language, then nothing.
 */
function pick(map: Record<string, string>, locale: string): string {
  const exact = map[locale]
  if (typeof exact === 'string' && exact.trim()) return exact

  const wanted = language(locale)
  for (const [code, value] of Object.entries(map)) {
    if (language(code) === wanted && typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return ''
}

/** Reads the value for `locale`, falling back to the default language. */
export function resolveValue(
  raw: unknown,
  locale: string,
  fallback: string = DEFAULT_LOCALE,
): string {
  if (typeof raw === 'string') return raw
  if (!raw || typeof raw !== 'object') return ''

  const map = raw as Record<string, string>

  // Empty string in the requested language is treated as "not translated yet"
  // rather than "deliberately blank" — a merchant clearing a field to blank it
  // is vanishingly rare next to one who simply has not got to it.
  return pick(map, locale) || pick(map, fallback)
}

/** Whether a map holds usable content for `locale`, variants included. */
export function hasValueFor(raw: unknown, locale: string): boolean {
  if (typeof raw === 'string') return Boolean(raw.trim())
  if (!raw || typeof raw !== 'object') return false
  return Boolean(pick(raw as Record<string, string>, locale))
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
      // Only well-formed language keys survive: the map's keys come from the
      // client, so anything else is a bug or an attempt to smuggle data
      // through a column Odoo treats as opaque.
      .filter(([code, value]) => isLocaleCode(code) && typeof value === 'string')
      .map(([code, value]) => [code, value as string]),
  )
}
