export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, loadUser } = useAuth()

  // Cheap local check first: no cookie/state at all → definitely not logged in.
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Authoritative check: ask Odoo "who am I?". If the session expired, the
  // local `odoo-user` cookie is still present but Odoo no longer recognises it,
  // so the whoami probe fails (or returns the public user) and `loadUser`
  // clears the stale auth. This catches a dead session on entry to any
  // protected route — no error-message guessing required.
  const valid = await loadUser(true)
  if (!valid) {
    return navigateTo('/login')
  }
})
