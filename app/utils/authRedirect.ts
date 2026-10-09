/**
 * Where to send a shopper who has to (re-)authenticate, and where to send
 * them back to afterwards.
 */

export const DEFAULT_AFTER_LOGIN = '/my-account'

// `redirect` brings the user back to the page they were after; `expired`
// makes the login page say why they were signed out instead of dropping them
// on a bare form.
export const loginRoute = (redirect?: string, expired: boolean = false) => ({
  path: '/login',
  query: {
    ...(redirect ? { redirect } : {}),
    ...(expired ? { expired: '1' } : {}),
  },
})

// The `redirect` query param is user-controlled, so only follow a same-site
// path: `//evil.com` or `/\evil.com` would otherwise send the user off-site
// straight after they type their password. Back to /login is a loop.
export const safeRedirect = (target: unknown): string => {
  if (typeof target !== 'string' || !/^\/(?![/\\])/.test(target) || /^\/login(?:[/?#]|$)/.test(target)) {
    return DEFAULT_AFTER_LOGIN
  }
  return target
}
