// The CMS persistence interface.
//
// The API routes, the editor and the render path talk only to `CmsStore`; the
// one implementation issues GraphQL against Odoo (server/utils/cmsOdooStore.ts).
// There is deliberately no local fallback: content, and the decision about who
// may edit it, always live in Odoo.

import type { H3Event } from 'h3'
import { createOdooCmsStore } from './cmsOdooStore'
import type { BlockInstance, CmsPage } from '#shared/cms/blocks'

export interface PageInput {
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
}

export interface SeoInput {
  metaTitle?: string
  metaDescription?: string
  /** A media library URL, or null to remove the image. */
  metaImage?: string | null
}

export interface CmsStore {
  list: () => Promise<CmsPage[]>
  get: (id: string) => Promise<CmsPage | null>
  /** Published-only read, by URL. This is what the storefront calls. */
  getPublishedBySlug: (slug: string) => Promise<CmsPage | null>
  create: (input: PageInput, blocks?: BlockInstance[]) => Promise<CmsPage>
  updateMeta: (id: string, input: Partial<PageInput>) => Promise<CmsPage>
  /** Meta title and description for one language. Empty removes that language's text. */
  saveSeo: (id: string, lang: string, input: SeoInput) => Promise<CmsPage>
  saveDraft: (id: string, blocks: BlockInstance[]) => Promise<CmsPage>
  publish: (id: string) => Promise<CmsPage>
  unpublish: (id: string) => Promise<CmsPage>
  discardDraft: (id: string) => Promise<CmsPage>
  remove: (id: string) => Promise<void>
}

export function normaliseSlug(raw: string): string {
  const trimmed = String(raw ?? '').trim().toLowerCase()
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return withSlash
    .replace(/\s+/g, '-')
    // Keep it to what is safe in a URL path segment.
    .replace(/[^a-z0-9\-/]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/\/{2,}/g, '/')
    // Trailing slash would make /about and /about/ two different pages.
    .replace(/(.)\/$/, '$1')
}

export function useCmsStore(event: H3Event): CmsStore {
  return createOdooCmsStore(event)
}
