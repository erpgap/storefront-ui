// The Odoo-backed CmsStore.
//
// This is the implementation the file-backed one in cmsStore.ts was always a
// placeholder for. Nothing above this file changed to accommodate it: the API
// routes, the studio and the render path all still talk to the CmsStore
// interface.
//
// Requests carry the editor's own Odoo session cookie, so Odoo's record rules
// and group checks apply to the real user and its audit trail names them.
// Authorisation is never decided here.

import type { H3Event } from 'h3'
import type { BlockInstance, CmsPage } from '#shared/cms/blocks'
import type { CmsStore, PageInput } from './cmsStore'
import {
  GetCmsPageDraftQuery,
  GetCmsPageQuery,
  GetCmsPagesQuery,
  GetCmsRevisionsQuery,
} from '../queries/CmsQueries'
import {
  CreateCmsPageMutation,
  DeleteCmsPageMutation,
  DiscardCmsDraftMutation,
  PublishCmsPageMutation,
  RestoreCmsRevisionMutation,
  SaveCmsDraftMutation,
  UnpublishCmsPageMutation,
  UpdateCmsPageMutation,
} from '../mutations/CmsMutations'

interface OdooCmsPage {
  id: number
  name: string
  url: string
  isPublished: boolean
  metaTitle?: string
  metaDescription?: string
  blocks?: BlockInstance[]
  draftBlocks?: BlockInstance[]
  liveRevision?: number
  updatedAt?: string
  hasUnpublishedChanges?: boolean
  blockCount?: number
  kind?: 'page' | 'region'
  regionKey?: string
  isSystem?: boolean
}

export interface CmsRevision {
  id: number
  number: number
  author?: string
  createdAt?: string
  restoredFrom?: number
  isLive: boolean
}

/**
 * Talks to Odoo directly rather than through /api/odoo/query.
 *
 * That route wraps every call in the shared SWR cache, whose key includes
 * pricelist and ISO code. CMS content varies by neither, and a studio that
 * reads a cached draft looks broken to the merchant editing it.
 */
async function callOdoo<T>(
  event: H3Event,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  const response = await $fetch<{ data?: T, errors?: { message: string }[] }>(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      // The editor's own session. Odoo decides what they may do.
      'Cookie': `session_id=${getCookie(event, 'session_id') ?? ''}`,
    },
    body: { query, variables },
  })

  if (response?.errors?.length) {
    const message = response.errors[0]!.message

    // Odoo's AccessError reaching a browser as a 500 would show the merchant
    // "something went wrong" when the real answer is "you are not an editor".
    const denied = /permission|access|not allowed/i.test(message)
    throw createError({
      statusCode: denied ? 403 : 400,
      statusMessage: message,
    })
  }

  return response.data as T
}

/**
 * Odoo's page shape to the storefront's.
 *
 * `blockCount` and `hasUnpublishedChanges` are carried through rather than
 * recomputed. The list query deliberately does not fetch block bodies - that
 * is what keeps it small - so deriving them here would compute both from
 * nothing and report every page as empty and unchanged.
 */
function toCmsPage(page: OdooCmsPage): CmsPage & {
  blockCount?: number
  hasUnpublishedChanges?: boolean
} {
  return {
    blockCount: page.blockCount,
    hasUnpublishedChanges: page.hasUnpublishedChanges,
    kind: page.kind ?? 'page',
    regionKey: page.regionKey ?? undefined,
    isSystem: Boolean(page.isSystem),
    id: String(page.id),
    title: page.name,
    slug: page.url,
    metaTitle: page.metaTitle ?? undefined,
    metaDescription: page.metaDescription ?? undefined,
    published: Boolean(page.isPublished),
    draft: page.draftBlocks ?? [],
    publishedBlocks: page.blocks ?? [],
    createdAt: page.updatedAt ?? new Date().toISOString(),
    updatedAt: page.updatedAt ?? new Date().toISOString(),
  }
}

/**
 * Collects the product, category and image ids referenced anywhere in a page's
 * blocks.
 *
 * Odoo cannot do this itself - the blocks column is opaque to it - so the
 * layer that understands the content mirrors them in on publish. They are what
 * makes "which live pages feature product X?" answerable, and therefore what
 * makes a product change refresh the right pages instead of waiting for a TTL.
 */
export function collectReferences(blocks: BlockInstance[]) {
  const products = new Set<number>()
  const categories = new Set<number>()
  const attachments = new Set<number>()

  const walk = (value: unknown, key = '') => {
    if (Array.isArray(value)) {
      value.forEach(item => walk(item, key))
      return
    }

    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        walk(childValue, childKey)
      }
      return
    }

    if (typeof value === 'number') {
      if (/product/i.test(key)) products.add(value)
      if (/categor/i.test(key)) categories.add(value)
      return
    }

    // Images are stored as the url Odoo served them at, so the attachment id
    // is recoverable from it.
    if (typeof value === 'string') {
      const match = /^\/web\/image\/(\d+)/.exec(value)
      if (match) attachments.add(Number(match[1]))
    }
  }

  blocks.forEach(block => walk(block.data))

  // Graphene camelCases input field names, so these must match the schema as
  // GraphQL exposes it, not as Python declares it.
  return {
    productTmplIds: [...products],
    categoryIds: [...categories],
    attachmentIds: [...attachments],
  }
}

export function createOdooCmsStore(event: H3Event): CmsStore & {
  revisions: (id: string) => Promise<CmsRevision[]>
  restore: (id: string, revisionId: string) => Promise<CmsPage>
} {
  return {
    async list() {
      const data = await callOdoo<{ cmsPages: { pages: OdooCmsPage[] } }>(
        event, GetCmsPagesQuery,
      )
      return (data.cmsPages?.pages ?? []).map(toCmsPage)
    },

    async get(id) {
      const data = await callOdoo<{ cmsPageDraft: OdooCmsPage | null }>(
        event, GetCmsPageDraftQuery, { id: Number(id) },
      )
      return data.cmsPageDraft ? toCmsPage(data.cmsPageDraft) : null
    },

    async getPublishedBySlug(slug) {
      const data = await callOdoo<{ cmsPage: OdooCmsPage | null }>(
        event, GetCmsPageQuery, { slug },
      )
      return data.cmsPage ? toCmsPage(data.cmsPage) : null
    },

    async create(input: PageInput, blocks: BlockInstance[] = []) {
      const data = await callOdoo<{ createCmsPage: OdooCmsPage }>(
        event, CreateCmsPageMutation,
        { name: input.title, url: input.slug, blocks },
      )
      return toCmsPage(data.createCmsPage)
    },

    async updateMeta(id, input) {
      const data = await callOdoo<{ updateCmsPage: OdooCmsPage }>(
        event, UpdateCmsPageMutation, {
          pageId: Number(id),
          name: input.title,
          url: input.slug,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
        },
      )
      return toCmsPage(data.updateCmsPage)
    },

    async saveDraft(id, blocks) {
      const data = await callOdoo<{ saveCmsDraft: OdooCmsPage }>(
        event, SaveCmsDraftMutation, { pageId: Number(id), blocks },
      )
      return toCmsPage(data.saveCmsDraft)
    },

    async publish(id) {
      // Mirror the references in the same call that creates the revision, so
      // a revision can never exist without them.
      const current = await this.get(id)
      const references = collectReferences(current?.draft ?? [])

      const data = await callOdoo<{ publishCmsPage: OdooCmsPage }>(
        event, PublishCmsPageMutation, { pageId: Number(id), references },
      )
      return toCmsPage(data.publishCmsPage)
    },

    async unpublish(id) {
      const data = await callOdoo<{ unpublishCmsPage: OdooCmsPage }>(
        event, UnpublishCmsPageMutation, { pageId: Number(id) },
      )
      return toCmsPage(data.unpublishCmsPage)
    },

    async discardDraft(id) {
      const data = await callOdoo<{ discardCmsDraft: OdooCmsPage }>(
        event, DiscardCmsDraftMutation, { pageId: Number(id) },
      )
      return toCmsPage(data.discardCmsDraft)
    },

    async remove(id) {
      await callOdoo(event, DeleteCmsPageMutation, { pageId: Number(id) })
    },

    async revisions(id) {
      const data = await callOdoo<{ cmsRevisions: CmsRevision[] }>(
        event, GetCmsRevisionsQuery, { pageId: Number(id) },
      )
      return data.cmsRevisions ?? []
    },

    async restore(id, revisionId) {
      const data = await callOdoo<{ restoreCmsRevision: OdooCmsPage }>(
        event, RestoreCmsRevisionMutation,
        { pageId: Number(id), revisionId: Number(revisionId) },
      )
      return toCmsPage(data.restoreCmsRevision)
    },
  }
}
