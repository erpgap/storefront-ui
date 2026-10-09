import { loginRoute } from '~~/app/utils/authRedirect'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, loadUser } = useAuth()

  // Cheap local check first: no cookie/state at all → definitely not logged in.
  if (!isAuthenticated.value) {
    return navigateTo(loginRoute(to.fullPath))
  }

  // Authoritative check: ask Odoo "who am I?". If the session expired, the
  // local `odoo-user` cookie is still present but Odoo no longer recognises it,
  // so the whoami probe fails (or returns the public user) and `loadUser`
  // clears the stale auth. This catches a dead session on entry to any
  // protected route — no error-message guessing required. The user believed
  // they were signed in, so the login page tells them the session expired.
  const valid = await loadUser(true)
  if (!valid) {
    return navigateTo(loginRoute(to.fullPath, true))
  }
})
