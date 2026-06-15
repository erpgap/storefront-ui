/**
 * Shared client-side validators.
 *
 * Note: email validation here is intentionally a lenient, pragmatic check to
 * catch obvious typos (missing `@`, missing domain, spaces) — it is NOT an
 * RFC-complete validator. The backend (and, ideally, a confirmation email)
 * remain the real source of truth for whether an address is valid/deliverable.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email: unknown): boolean =>
  EMAIL_REGEX.test(String(email ?? '').trim())
