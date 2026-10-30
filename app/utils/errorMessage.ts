// The message to show for a failed request. The server's own lies under
// whichever wrapper the call used - the SDK's SDKError (in `cause`), ofetch's
// FetchError (in `data`), useFetch's error (in `data`) - and the wrappers'
// own messages ("[POST] http://...: 500 Server Error") mean nothing to a
// shopper and show internal addresses, so they are skipped.

const isStatusNoise = (message: string) =>
  /^\[|\b500\b|server error|failed to fetch/i.test(message)

function findMessage(value: any, depth = 0): string {
  if (value == null || depth > 6) return ''
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findMessage(item, depth + 1)
      if (message) return message
    }
    return ''
  }
  if (typeof value !== 'object') return ''
  const message = value.message
  if (typeof message === 'string' && message && !isStatusNoise(message)) return message
  return findMessage(value.data, depth + 1)
    || findMessage(value.cause, depth + 1)
    || findMessage(value.errors, depth + 1)
    || findMessage(value.response?._data, depth + 1)
}

export function errorMessage(error: unknown, fallback = ''): string {
  return findMessage(error) || fallback
}
