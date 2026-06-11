import { defineNitroPlugin } from 'nitropack/runtime'
import { getSlugsByModel, SlugModels } from '../utils/slugStorage'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:index-resolved', async (ctx) => {
    const blogSlugs = await getSlugsByModel(SlugModels.websitePage)
    if (blogSlugs.length === 0) {
      ctx.sitemaps = ctx.sitemaps.filter(s => !s.sitemap.includes('/blogs'))
    }
  })
})
