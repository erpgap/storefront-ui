import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import { getSlugsByModel, SlugModels } from '../../../utils/slugStorage'

export default defineSitemapEventHandler(async () => {
  const slugs = await getSlugsByModel(SlugModels.product)

  return slugs.map(slug => ({
    loc: slug,
    _sitemap: 'products',
  } satisfies SitemapUrlInput))
})
