import { describe, expect, it } from 'vitest'
import { DEFAULT_AFTER_LOGIN, loginRoute, safeRedirect } from './authRedirect'

describe('loginRoute', () => {
  it('sends a signed-out user to login and back to where they were going', () => {
    expect(loginRoute('/my-account/personal-data')).toEqual({
      path: '/login',
      query: { redirect: '/my-account/personal-data' },
    })
  })

  it('flags an expired session so the login page can explain it', () => {
    expect(loginRoute('/my-account/personal-data', true)).toEqual({
      path: '/login',
      query: { redirect: '/my-account/personal-data', expired: '1' },
    })
  })

  it('leaves out an empty redirect', () => {
    expect(loginRoute()).toEqual({ path: '/login', query: {} })
    expect(loginRoute('', true)).toEqual({ path: '/login', query: { expired: '1' } })
  })
})

describe('safeRedirect', () => {
  it('follows a same-site path, query and hash included', () => {
    expect(safeRedirect('/my-account/personal-data')).toBe('/my-account/personal-data')
    expect(safeRedirect('/my-account/my-orders?page=2#top')).toBe('/my-account/my-orders?page=2#top')
  })

  it('refuses to leave the site', () => {
    for (const target of [
      '//evil.com',
      '/\\evil.com',
      'https://evil.com',
      'javascript:alert(1)',
      'evil.com/my-account',
    ]) {
      expect(safeRedirect(target), target).toBe(DEFAULT_AFTER_LOGIN)
    }
  })

  it('does not loop back to the login page', () => {
    expect(safeRedirect('/login')).toBe(DEFAULT_AFTER_LOGIN)
    expect(safeRedirect('/login?expired=1')).toBe(DEFAULT_AFTER_LOGIN)
    // Only the login page itself, not anything that happens to start with it.
    expect(safeRedirect('/login-help')).toBe('/login-help')
  })

  it('falls back when the param is missing or repeated', () => {
    // Vue Router hands over `?redirect=a&redirect=b` as an array.
    expect(safeRedirect(undefined)).toBe(DEFAULT_AFTER_LOGIN)
    expect(safeRedirect(null)).toBe(DEFAULT_AFTER_LOGIN)
    expect(safeRedirect('')).toBe(DEFAULT_AFTER_LOGIN)
    expect(safeRedirect(['/my-account/personal-data'])).toBe(DEFAULT_AFTER_LOGIN)
  })
})
