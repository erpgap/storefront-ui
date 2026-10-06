import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// PoC storage: the app's own public/ directory, so <NuxtImg> serves the file
// with no extra infrastructure. In the Odoo implementation this handler posts
// to a multipart controller that creates an `ir.attachment` and returns its
// image_url — the editor side of the upload does not change.
const UPLOAD_DIR = join(process.cwd(), 'public', 'img', 'cms')
const PUBLIC_PREFIX = '/img/cms'

// An allowlist, not a denylist: an SVG upload is a stored-XSS vector because
// SVG can carry <script>, so it is deliberately absent.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

const MAX_BYTES = 8 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No file was uploaded.' })
  }

  const extension = ALLOWED[file.type ?? '']
  if (!extension) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Images only — JPG, PNG, WebP, AVIF or GIF.',
    })
  }

  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Images must be under 8 MB.' })
  }

  // The client-supplied filename is kept only as a readable prefix; the random
  // segment and the extension come from the sniffed MIME type, so a crafted
  // name cannot control the path or the served content type.
  const stem = (file.filename ?? 'image')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'image'

  const name = `${stem}-${randomUUID().slice(0, 8)}.${extension}`

  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(join(UPLOAD_DIR, name), file.data)

  return { url: `${PUBLIC_PREFIX}/${name}`, name, size: file.data.length }
})
