// plugins/sdk-logger.server.ts
export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error – não vamos tipar o sdk agora
  const originalSdk = nuxtApp.$sdk()

  // cria um proxy que intercepta .odoo.query
  const query = (...args: any[]) => {
    const [opts, vars] = args
    if (opts?.queryName) {
      console.info('[GQL]', opts.queryName, JSON.stringify(vars))
    } else {
      console.info('[GQL anonymous]', JSON.stringify(vars))
    }
    const t0 = Date.now()
    return originalSdk.odoo.query(...args).finally(() => {
      console.info(`[GQL done] ${opts?.queryName ?? 'anonymous'} ${Date.now() - t0}ms`)
    })
  }

  // expõe um SDK “igual”, mas com query logada
  const wrapped = {
    ...originalSdk,
    odoo: { ...originalSdk.odoo, query }
  }

  return { provide: { sdk: () => wrapped } }
})
