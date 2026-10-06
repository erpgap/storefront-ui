import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

// Lists what the merchant can pick from. Without Odoo: images they uploaded,
// plus the storefront's existing art so an empty library is still usable on
// day one.
const SOURCES = [
  { dir: join(process.cwd(), 'public', 'img', 'cms'), prefix: '/img/cms' },
  { dir: join(process.cwd(), 'public', 'img', 'home'), prefix: '/img/home' },
]

const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i

export default defineEventHandler(async (event) => {
  // With Odoo, the library is Odoo's: images are attachments there, with its
  // access rules and backups, and the demo content's images live there too.
  if (cmsUsesOdoo()) return listOdooMedia(event)

  const groups = await Promise.all(SOURCES.map(async ({ dir, prefix }) => {
    let names: string[] = []
    try {
      names = await readdir(dir)
    }
    catch {
      // Directory may not exist yet — an empty library, not an error.
      return []
    }

    const files = await Promise.all(
      names.filter(name => IMAGE.test(name)).map(async (name) => {
        const info = await stat(join(dir, name))
        return {
          url: `${prefix}/${name}`,
          name,
          size: info.size,
          uploadedAt: info.mtime.toISOString(),
          uploaded: prefix === '/img/cms',
        }
      }),
    )

    return files
  }))

  // Newest uploads first, so the image you just added is at the top.
  return groups
    .flat()
    .sort((a, b) => Number(b.uploaded) - Number(a.uploaded)
      || b.uploadedAt.localeCompare(a.uploadedAt))
})
