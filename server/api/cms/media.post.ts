// The upload is forwarded to Odoo and becomes an `ir.attachment` - see
// server/utils/cmsOdooMedia.ts. Odoo checks the type and size and decides
// whether this user may upload at all.
export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No file was uploaded.' })
  }

  return uploadOdooMedia(event, file)
})
