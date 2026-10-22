// The CMS media library, backed by Odoo.
//
// Images are ir.attachment records created by graphql_alokai's
// /alokai/cms/upload controller and listed by /alokai/cms/media. Requests carry
// the editor's own Odoo session, so Odoo decides who may list and upload - the
// same as every other CMS call. Images are referred to by the /web/image/<id>
// URL Odoo returns, which is also how publishing finds which attachments a page
// uses (see collectReferences in cmsOdooStore.ts).

import type { H3Event } from 'h3'

interface OdooMediaItem {
  id: number
  name: string
  size: number
  uploadedAt: string | null
  url: string
}

export interface MediaItem {
  url: string
  name: string
  size: number
  uploadedAt: string
  uploaded: boolean
}

interface MultipartFile {
  data: Buffer
  filename?: string
  type?: string
}

function odooUrl(event: H3Event, path: string): string {
  return new URL(path, useRuntimeConfig(event).public.odooBaseUrl as string).toString()
}

function sessionHeaders(event: H3Event) {
  return { Cookie: `session_id=${getCookie(event, 'session_id') ?? ''}` }
}

/**
 * Odoo answers a refused request with `{ error }` and a status. Keep both, so
 * "Images only" reaches the merchant as that, not as a generic failure.
 */
function forwardError(error: any): never {
  const status = error?.response?.status ?? error?.statusCode ?? 502
  const message = error?.data?.error
    ?? (status === 403 ? 'You do not have permission to upload images.' : 'The media library is not responding.')
  throw createError({ statusCode: status, statusMessage: message })
}

export async function listOdooMedia(event: H3Event): Promise<MediaItem[]> {
  const items = await $fetch<OdooMediaItem[]>(odooUrl(event, '/alokai/cms/media'), {
    headers: sessionHeaders(event),
  }).catch(forwardError)

  return items.map(item => ({
    url: item.url,
    name: item.name,
    size: item.size,
    uploadedAt: item.uploadedAt ?? '',
    uploaded: true,
  }))
}

export async function uploadOdooMedia(event: H3Event, file: MultipartFile) {
  const body = new FormData()
  body.append(
    'file',
    new Blob([new Uint8Array(file.data)], { type: file.type ?? 'application/octet-stream' }),
    file.filename ?? 'image',
  )

  const result = await $fetch<OdooMediaItem>(odooUrl(event, '/alokai/cms/upload'), {
    method: 'POST',
    headers: sessionHeaders(event),
    body,
  }).catch(forwardError)

  return { url: result.url, name: result.name, size: result.size }
}
