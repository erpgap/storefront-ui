import type { Ref } from 'vue'
import { loginRoute } from '~~/app/utils/authRedirect'

/**
 * Sends the shopper to log in again, told their session expired, as soon as
 * it ends while an account page stays open: a logout in another tab, or the
 * Odoo session expiring. The auth-check middleware only runs on navigation,
 * so without this the page went on showing their data until they clicked
 * somewhere else.
 *
 * session_id is HttpOnly, so the server confirms it (/api/auth/session). It
 * is asked when the odoo-user cookie changes (the Cookie Store API, in
 * Chromium and Safari), when the tab comes back into view or focus, and on
 * interaction, at most every 5 seconds. A request that fails does not count
 * as a logout (see hasValidSession).
 *
 * @param paused skip the check while the page logs out itself, as that has
 * its own redirect
 */
export const useSessionGuard = (paused?: Ref<boolean>) => {
  if (import.meta.server) return

  const { hasValidSession, clearUser } = useAuth()
  const route = useRoute()

  let checking = false
  const check = async () => {
    if (checking || paused?.value) return
    checking = true
    try {
      if (!(await hasValidSession()) && !paused?.value) {
        // Forgotten only once on the login page: a navigation racing this one
        // then still finds a login in auth-check, which also says it expired,
        // instead of none, which sent to the login page without saying why.
        await navigateTo(loginRoute(route.fullPath, true))
        clearUser()
      }
    }
    finally {
      checking = false
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') check()
  }

  // Focus is not always reported (coming back from docked DevTools, some
  // in-page cases), so interaction checks too, throttled.
  const INTERACTION_CHECK_INTERVAL = 5000
  let lastInteractionCheck = 0
  const onInteraction = () => {
    const now = Date.now()
    if (now - lastInteractionCheck < INTERACTION_CHECK_INTERVAL) return
    lastInteractionCheck = now
    check()
  }

  const onCookieChange = (event: Event) => {
    const { changed = [], deleted = [] } = event as Event & { changed?: { name: string }[], deleted?: { name: string }[] }
    if ([...changed, ...deleted].some(cookie => cookie.name === 'odoo-user')) check()
  }
  const cookieStore = (globalThis as { cookieStore?: EventTarget }).cookieStore

  onMounted(() => {
    cookieStore?.addEventListener('change', onCookieChange)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('pointerdown', onInteraction, { passive: true })
    document.addEventListener('keydown', onInteraction, { passive: true })
  })

  onBeforeUnmount(() => {
    cookieStore?.removeEventListener('change', onCookieChange)
    window.removeEventListener('focus', check)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('pointerdown', onInteraction)
    document.removeEventListener('keydown', onInteraction)
  })
}
