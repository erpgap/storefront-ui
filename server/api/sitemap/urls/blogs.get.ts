import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import { getSlugsByModel, SlugModels } from '../../../utils/slugStorage'

export default defineSitemapEventHandler(async () => {
  const slugs = await getSlugsByModel(SlugModels.websitePage)

  return slugs.map(slug => ({
    loc: slug,
    _sitemap: 'blogs',
  } satisfies SitemapUrlInput))
})
