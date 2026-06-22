/**
 * Formats a raw Odoo timestamp (e.g. "2026-05-21 21:12:18.496262") as a clean
 * "May 21, 2026". Falls back to the date portion if parsing fails, and returns
 * an empty string for empty input.
 */
export const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const iso = String(value).replace(' ', 'T').replace(/\.\d+$/, '')
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? String(value).split(' ')[0]
    : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
