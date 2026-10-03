// The CMS persistence adapter.
//
// THIS IS THE SWAP POINT. Everything above it — the API routes, the studio, the
// render path — talks only to the `CmsStore` interface below. Today it is
// backed by Nitro's `cms` storage (an fs driver in dev, see nuxt.config.ts).
// Moving to Odoo means writing one more implementation of this interface that
// issues GraphQL against `alokai.website.page` / `alokai.page.block`, and
// changing the single `export const cmsStore =` line at the bottom.
//
// Nothing else in the codebase needs to know which one is in use.

import type { H3Event } from 'h3'
import { createOdooCmsStore } from './cmsOdooStore'
import type { BlockInstance, CmsPage } from '#shared/cms/blocks'

export interface PageInput {
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
}

export interface CmsStore {
  list: () => Promise<CmsPage[]>
  get: (id: string) => Promise<CmsPage | null>
  /** Published-only read, by URL. This is what the storefront calls. */
  getPublishedBySlug: (slug: string) => Promise<CmsPage | null>
  create: (input: PageInput, blocks?: BlockInstance[]) => Promise<CmsPage>
  updateMeta: (id: string, input: Partial<PageInput>) => Promise<CmsPage>
  saveDraft: (id: string, blocks: BlockInstance[]) => Promise<CmsPage>
  publish: (id: string) => Promise<CmsPage>
  unpublish: (id: string) => Promise<CmsPage>
  discardDraft: (id: string) => Promise<CmsPage>
  remove: (id: string) => Promise<void>
}

const storage = () => useStorage<CmsPage>('cms')

const INDEX_KEY = 'index'
const pageKey = (id: string) => `page:${id}`

/** Slugs the storefront already owns. A CMS page may not shadow them. */
const RESERVED_SLUGS = [
  '/', '/products', '/cart', '/checkout', '/my-account', '/login',
  '/register', '/search', '/wishlist', '/studio',
]

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

function nowIso() {
  return new Date().toISOString()
}

async function readIndex(): Promise<string[]> {
  const index = await useStorage<string[]>('cms').getItem(INDEX_KEY)
  return Array.isArray(index) ? index : []
}

async function writeIndex(ids: string[]) {
  await useStorage<string[]>('cms').setItem(INDEX_KEY, ids)
}

async function readPage(id: string): Promise<CmsPage | null> {
  return (await storage().getItem(pageKey(id))) ?? null
}

async function writePage(page: CmsPage): Promise<CmsPage> {
  await storage().setItem(pageKey(page.id), page)
  return page
}

async function mustGet(id: string): Promise<CmsPage> {
  const page = await readPage(id)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: `No CMS page with id ${id}` })
  }
  return page
}

async function assertSlugFree(slug: string, exceptId?: string) {
  if (RESERVED_SLUGS.includes(slug)) {
    throw createError({
      statusCode: 409,
      statusMessage: `"${slug}" is reserved by the storefront.`,
    })
  }

  const pages = await fileStore.list()
  const clash = pages.find(page => page.slug === slug && page.id !== exceptId)

  if (clash) {
    throw createError({
      statusCode: 409,
      statusMessage: `"${slug}" is already used by the page "${clash.title}".`,
    })
  }
}

const fileStore: CmsStore = {
  async list() {
    const ids = await readIndex()
    const pages = await Promise.all(ids.map(readPage))

    return pages
      .filter((page): page is CmsPage => Boolean(page))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  get: readPage,

  async getPublishedBySlug(slug) {
    const wanted = normaliseSlug(slug)
    const pages = await fileStore.list()

    // `published` is the gate, and `publishedBlocks` is a separate column from
    // `draft` — so an unpublished edit can never leak to a storefront visitor.
    return pages.find(page => page.slug === wanted && page.published) ?? null
  },

  async create(input, blocks = []) {
    const slug = normaliseSlug(input.slug)
    await assertSlugFree(slug)

    const timestamp = nowIso()
    const page: CmsPage = {
      id: `page_${Math.random().toString(36).slice(2, 10)}`,
      title: input.title,
      slug,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      published: false,
      draft: blocks,
      publishedBlocks: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await writePage(page)
    await writeIndex([...(await readIndex()), page.id])

    return page
  },

  async updateMeta(id, input) {
    const page = await mustGet(id)

    if (input.slug !== undefined) {
      const slug = normaliseSlug(input.slug)
      await assertSlugFree(slug, id)
      page.slug = slug
    }

    if (input.title !== undefined) page.title = input.title
    if (input.metaTitle !== undefined) page.metaTitle = input.metaTitle
    if (input.metaDescription !== undefined) page.metaDescription = input.metaDescription

    page.updatedAt = nowIso()
    return writePage(page)
  },

  async saveDraft(id, blocks) {
    const page = await mustGet(id)
    page.draft = blocks
    page.updatedAt = nowIso()
    return writePage(page)
  },

  async publish(id) {
    const page = await mustGet(id)
    // Publish is a COPY, not a pointer swap: the draft stays editable
    // immediately afterwards without touching what visitors see.
    page.publishedBlocks = JSON.parse(JSON.stringify(page.draft))
    page.published = true
    page.publishedAt = nowIso()
    page.updatedAt = page.publishedAt
    return writePage(page)
  },

  async unpublish(id) {
    const page = await mustGet(id)
    page.published = false
    page.updatedAt = nowIso()
    return writePage(page)
  },

  async discardDraft(id) {
    const page = await mustGet(id)
    page.draft = JSON.parse(JSON.stringify(page.publishedBlocks))
    page.updatedAt = nowIso()
    return writePage(page)
  },

  async remove(id) {
    await storage().removeItem(pageKey(id))
    await writeIndex((await readIndex()).filter(existing => existing !== id))
  },
}

/**
 * Picks the backend.
 *
 * Odoo is the real store. The file store is kept because it is the only way to
 * run the studio without an Odoo instance - useful for front-end work and for
 * demoing on a laptop - and because keeping a second implementation honest is
 * what proves the interface is actually an interface.
 *
 * Set NUXT_CMS_BACKEND=file to use it.
 */
export function useCmsStore(event: H3Event): CmsStore {
  if (process.env.NUXT_CMS_BACKEND === 'file') return fileStore
  return createOdooCmsStore(event)
}

/** The file-backed store, for the seed plugin which has no request context. */
export const cmsStore: CmsStore = fileStore
