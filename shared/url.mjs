// Base URLs from the environment are kept without a trailing slash, and every
// path joined onto one starts with its own: `${base}/graphql/vsf`. Whether the
// .env has "https://odoo.example.com" or "https://odoo.example.com/", the
// result is the same - before, one form or the other gave "//graphql/vsf".
//
// Plain .mjs so nuxt.config, build modules, Nitro and the app can all import it.

/** The URL keys of runtimeConfig.public that hold base URLs. */
export const PUBLIC_BASE_URL_KEYS = ['odooBaseUrl', 'odooBaseImageUrl', 'middlewareUrl', 'siteURL']

/**
 * @template {string | undefined | null} T
 * @param {T} url
 * @returns {T}
 */
export function withoutTrailingSlash(url) {
  return /** @type {T} */ (typeof url === 'string' ? url.replace(/\/+$/, '') : url)
}
