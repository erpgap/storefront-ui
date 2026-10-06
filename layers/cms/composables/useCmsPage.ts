import type { BlockInstance } from '#shared/cms/blocks'

export interface PublishedCmsPage {
  id: string
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  metaImage?: string
  blocks: BlockInstance[]
  publishedAt?: string
}

/**
 * Reads a published CMS page by URL. Server-side on first render, so blocks are
 * in the HTML for crawlers (§9.5).
 *
 * `useFetch` keys on the slug, so the payload is transferred to the client
 * rather than re-fetched on hydration.
 */
export async function useCmsPage(slug: string) {
  return useFetch<PublishedCmsPage | null>('/api/cms/published', {
    query: { slug },
    key: `cms-page:${slug}`,
  })
}
