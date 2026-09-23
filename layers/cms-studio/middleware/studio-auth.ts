/**
 * Keeps the studio behind a login.
 *
 * A UI affordance, not a security boundary: it decides whether to show the
 * editor or the login form. Authorisation happens in Odoo on every single
 * write, against the real user, so a browser that skips this middleware gains
 * nothing but a screen full of failing requests.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/studio')) return
  if (to.path === '/studio/login') return

  const { data } = await useFetch<{ canEdit: boolean }>('/api/cms/session', {
    key: 'cms-session',
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  if (!data.value?.canEdit) {
    return navigateTo({
      path: '/studio/login',
      query: to.fullPath === '/studio' ? undefined : { next: to.fullPath },
    })
  }
})
