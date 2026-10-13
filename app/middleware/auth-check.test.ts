import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const auth = {
  isAuthenticated: { value: false },
  hasValidSession: vi.fn<() => Promise<boolean>>(),
  clearUser: vi.fn(),
  loadUser: vi.fn(),
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
  auth.hasValidSession.mockReset()
  auth.clearUser.mockReset()
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
    expect(auth.hasValidSession).not.toHaveBeenCalled()
  })

  it('sends a user whose session cookie is missing or changed to log in, saying it expired', async () => {
    auth.isAuthenticated.value = true
    auth.hasValidSession.mockResolvedValue(false)

    expect(await guard(to)).toEqual({
      path: '/login',
      query: { redirect: '/my-account/personal-data', expired: '1' },
    })
    expect(auth.clearUser).toHaveBeenCalled()
  })

  it('does not call Odoo', async () => {
    auth.isAuthenticated.value = true
    auth.hasValidSession.mockResolvedValue(true)

    await guard(to)

    expect(auth.loadUser).not.toHaveBeenCalled()
  })

  it('lets a user with a valid session through', async () => {
    auth.isAuthenticated.value = true
    auth.hasValidSession.mockResolvedValue(true)

    expect(await guard(to)).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('keeps the query string of the page the user asked for', async () => {
    auth.isAuthenticated.value = true
    auth.hasValidSession.mockResolvedValue(false)

    expect(await guard({ fullPath: '/my-account/my-orders?page=2' })).toEqual({
      path: '/login',
      query: { redirect: '/my-account/my-orders?page=2', expired: '1' },
    })
  })
})
