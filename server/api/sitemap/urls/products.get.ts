import { getSlugsByModel, SlugModels } from '../../../utils/slugStorage'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const slugs = await getSlugsByModel(SlugModels.product)

  return slugs.map(slug => ({
    loc: slug,
    _sitemap: 'products',
  } satisfies SitemapUrlInput))
})
