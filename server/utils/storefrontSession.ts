import type { H3Event } from 'h3'

// The password every session used to be sealed with, written into each
// caller and so published with the source. Kept only as the fallback while
// NUXT_SESSION_PASSWORD is not configured, so deploying this does not log
// every visitor out of their cart on its own.
const PUBLISHED_PASSWORD = 'b013b03ac2231e0b448e9a22ba488dcf'

let warned = false

/**
 * The password storefront sessions are sealed with: NUXT_SESSION_PASSWORD.
 *
 * The session only carries a random id that keys the visitor's cart,
 * wishlist and pricelist in Redis, but anyone holding the password can mint
 * session cookies, so it must not be the one in the repository. Setting it
 * makes existing session cookies unreadable once: those visitors start a new
 * cart.
 */
export function storefrontSessionPassword(): string {
  const configured = String(useRuntimeConfig().sessionPassword || '')
  if (configured.length >= 32) return configured

  if (!warned) {
    warned = true
    console.warn(
      '[session] NUXT_SESSION_PASSWORD is not set (or is shorter than 32 characters). '
      + 'Sessions are sealed with the password that used to be in the source code; '
      + 'set it to a random value of at least 32 characters.',
    )
  }
  return PUBLISHED_PASSWORD
}

/** The visitor's storefront session (cart, wishlist and pricelist key). */
export function useStorefrontSession(event: H3Event) {
  return useSession(event, { password: storefrontSessionPassword() })
}
