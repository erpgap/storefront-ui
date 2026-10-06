/**
 * Keeps the editor behind a login.
 *
 * A UI affordance, not a security boundary: it decides whether to show the
 * editor or the login form. Authorisation happens in Odoo on every single
 * write, against the real user, so a browser that skips this middleware gains
 * nothing but a screen full of failing requests.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/cms')) return
  if (to.path === '/cms/login') return

  const { data } = await useFetch<{ canEdit: boolean }>('/api/cms/session', {
    key: 'cms-session',
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  if (!data.value?.canEdit) {
    return navigateTo({
      path: '/cms/login',
      query: to.fullPath === '/cms' ? undefined : { next: to.fullPath },
    })
  }
})
