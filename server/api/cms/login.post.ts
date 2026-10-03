/**
 * Studio login.
 *
 * Reuses Odoo's existing session login - the same mechanism cart and account
 * already use - so there is no token service, no secret to rotate, and Odoo's
 * audit trail names the real person. That last part is what makes the revision
 * list able to say who published something.
 *
 * Kept separate from the customer login route so editor and shopper sessions
 * stay conceptually distinct and TOTP can be required on one and not the other.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' })
  }

  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  let response
  try {
    response = await $fetch.raw<{
      data?: { login?: { user?: { id: number, name: string } } }
      errors?: { message: string }[]
    }>(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        query: `mutation ($email: String!, $password: String!) {
          login(email: $email, password: $password) { user { id name } }
        }`,
        variables: { email: body.email, password: body.password },
      },
    })
  }
  catch (error: any) {
    // An unreachable Odoo surfaced as a bare "Server Error", which tells a
    // merchant nothing and sends them looking for a typo in their password.
    if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed/i.test(String(error?.message ?? ''))) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Cannot reach Odoo. The content system is offline — '
          + 'this is not a problem with your password.',
      })
    }
    throw error
  }

  if (response._data?.errors?.length) {
    throw createError({ statusCode: 401, statusMessage: 'Those details did not work.' })
  }

  // Hand Odoo's session cookie to the browser so subsequent CMS calls carry it.
  const setCookie = response.headers.getSetCookie?.() ?? []
  for (const cookie of setCookie) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  const user = response._data?.data?.login?.user

  // Being able to log in is not being allowed to edit: a customer account
  // authenticates fine and must still be refused.
  const session = await $fetch<{ canEdit: boolean }>('/api/cms/session', {
    headers: {
      cookie: setCookie.map(c => c.split(';')[0]).join('; '),
    },
  }).catch(() => ({ canEdit: false }))

  if (!session.canEdit) {
    throw createError({
      statusCode: 403,
      statusMessage: 'That account does not have permission to edit content.',
    })
  }

  return { user }
})
