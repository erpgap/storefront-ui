import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The guard on the account pages. `isAuthenticated` only reflects the
 * storefront's own `odoo-user` cookie, which outlives a deleted, expired or
 * tampered `session_id`; the guard has to ask Odoo and act on its answer.
 *
 * Nuxt's auto-imports are stubbed as globals, so this runs in plain node.
 */
const auth = {
  isAuthenticated: { value: false },
  loadUser: vi.fn<(withoutCache?: boolean) => Promise<boolean>>(),
}
const navigateTo = vi.fn((to: unknown) => to)

let guard: (to: { fullPath: string }) => Promise<unknown>

beforeAll(async () => {
  vi.stubGlobal('defineNuxtRouteMiddleware', (fn: unknown) => fn)
  vi.stubGlobal('useAuth', () => auth)
  vi.stubGlobal('navigateTo', navigateTo)
  guard = (await import('./auth-check')).default as unknown as typeof guard
})

beforeEach(() => {
  auth.isAuthenticated.value = false
  auth.loadUser.mockReset()
  navigateTo.mockClear()
})

const to = { fullPath: '/my-account/personal-data' }

describe('auth-check middleware', () => {
  it('sends a signed-out user to log in, without claiming a session expired', async () => {
    expect(await guard(to)).toEqual({
      path: '/login',
      query: { redirect: '/my-account/personal-data' },
    })
    // No point asking Odoo when there is nothing to check.
    expect(auth.loadUser).not.toHaveBeenCalled()
  })

  it('sends a user whose session Odoo no longer recognises to log in, saying it expired', async () => {
    auth.isAuthenticated.value = true
    auth.loadUser.mockResolvedValue(false)

    expect(await guard(to)).toEqual({
      path: '/login',
      query: { redirect: '/my-account/personal-data', expired: '1' },
    })
  })

  it('asks Odoo directly rather than trusting a cached answer', async () => {
    auth.isAuthenticated.value = true
    auth.loadUser.mockResolvedValue(true)

    await guard(to)

    expect(auth.loadUser).toHaveBeenCalledWith(true)
  })

  it('lets a user with a live session through', async () => {
    auth.isAuthenticated.value = true
    auth.loadUser.mockResolvedValue(true)

    expect(await guard(to)).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('keeps the query string of the page the user asked for', async () => {
    auth.isAuthenticated.value = true
    auth.loadUser.mockResolvedValue(false)

    expect(await guard({ fullPath: '/my-account/my-orders?page=2' })).toEqual({
      path: '/login',
      query: { redirect: '/my-account/my-orders?page=2', expired: '1' },
    })
  })
})
