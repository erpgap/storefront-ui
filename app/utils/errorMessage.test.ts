import { describe, expect, it } from 'vitest'
import { errorMessage } from './errorMessage'

// What /api/odoo/* answers when Odoo refuses: h3's error body.
const body = { statusCode: 500, message: 'Wrong login/password', data: [{ message: 'Wrong login/password' }] }

describe('errorMessage', () => {
  it('reads an $sdk call\'s error, which the SDK wraps in cause', () => {
    const fetchError = Object.assign(new Error('[POST] "/api/odoo/mutation": 500 Server Error'), { data: body })
    const sdkError = Object.assign(new Error(fetchError.message), { name: 'SDKError', cause: fetchError })
    expect(errorMessage(sdkError)).toBe('Wrong login/password')
  })

  it('reads a $fetch or useFetch error, which carries the body in data', () => {
    expect(errorMessage({ message: '[GET] "/api/x": 500', data: body })).toBe('Wrong login/password')
  })

  it('never shows the wrapper\'s message with the internal address', () => {
    const noBody = Object.assign(new Error('[POST] "http://odoo:8069/graphql/vsf": 500 Server Error'), { data: undefined })
    expect(errorMessage(noBody, 'Please try again.')).toBe('Please try again.')
  })

  it('falls back when there is nothing to show', () => {
    expect(errorMessage(undefined, 'fallback')).toBe('fallback')
    expect(errorMessage(new Error('Failed to fetch'), 'fallback')).toBe('fallback')
  })
})
