// plugins/log-fetch.server.ts
export default defineNuxtPlugin(() => {
  const orig = globalThis.fetch
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as URL).toString()
    const isGql = url.includes('/graphql/')
    if (isGql) {
      let body = ''
      try { body = typeof init?.body === 'string' ? init.body : '' } catch {}
      console.info('[SERVER fetch→]', url, 'method=', init?.method ?? 'GET', 'body=', body.slice(0, 300))
    }
    const res = await orig(input as any, init)
    if (isGql) console.info('[SERVER fetch←]', url, 'status=', (res as Response).status)
    return res
  }
})
