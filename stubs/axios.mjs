// Stub for `axios`.
//
// The Odoo SDK (@erpgap/odoo-sdk) does `import axios from 'axios'` and creates an
// instance at module load, but the app configures the SDK with an `ofetch`
// transport (app/plugins/2.sdk.ts), so the axios instance is never used to make
// a request — all queries/mutations go through ofetch. Aliasing `axios` to this
// stub (see nuxt.config `vite.resolve.alias`) keeps ~35 KB of axios out of the
// client bundle.
//
// If anything ever actually calls an axios request method, it throws loudly so
// the regression is obvious in testing rather than silently shipping axios back.
const noop = () => {}
const stubbed = () => {
  throw new Error('[axios-stub] axios is stubbed out — the Odoo SDK must use the ofetch transport')
}

const instance = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: noop, eject: noop },
    response: { use: noop, eject: noop },
  },
  get: stubbed,
  post: stubbed,
  put: stubbed,
  patch: stubbed,
  delete: stubbed,
  head: stubbed,
  options: stubbed,
  request: stubbed,
}

const axios = Object.assign(stubbed, {
  create: () => instance,
  defaults: instance.defaults,
  interceptors: instance.interceptors,
})

export default axios
export { axios }
