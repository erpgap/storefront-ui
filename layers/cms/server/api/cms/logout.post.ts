/**
 * CMS logout: ends the Odoo session the CMS login started.
 *
 * The editor and the shop share Odoo's session cookie, so this also logs the
 * same browser out of the shop, as logging out of Odoo itself would.
 */
export default defineEventHandler(async (event) => {
  try {
    const response = await odooGraphqlRaw(event, 'mutation { logout }', undefined, { session: true })
    // Odoo's answer may rotate or clear the session cookie: pass it on.
    for (const cookie of response.headers.getSetCookie?.() ?? []) {
      appendResponseHeader(event, 'set-cookie', cookie)
    }
    if (response._data?.errors?.length) throw response
  }
  catch (error) {
    throw odooProxyError(error)
  }
  return { ok: true }
})
