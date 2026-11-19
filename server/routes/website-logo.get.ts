/**
 * The website's logo (server/utils/websiteLogo.ts). Asked for with its
 * version (?v=), which changes with the image, so browsers keep it a year;
 * without it, five minutes.
 *
 * A logo is uploaded by the merchant and may be an SVG, which can carry
 * script: shown as an <img> it never runs, and opened on its own this policy
 * keeps it from running on the storefront's origin.
 */
export default defineEventHandler(async (event) => {
  const logo = await websiteLogo(event)
  if (!logo) throw createError({ statusCode: 404, statusMessage: 'No logo' })

  const current = getQuery(event).v === logo.version
  setResponseHeaders(event, {
    'content-type': logo.type,
    'cache-control': current ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    'x-content-type-options': 'nosniff',
    'content-security-policy': 'default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; sandbox',
  })
  return Buffer.from(logo.body, 'base64')
})
