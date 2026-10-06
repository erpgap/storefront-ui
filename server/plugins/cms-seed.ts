import type { BlockInstance } from '#shared/cms/blocks'

// Seeds the PoC store on first boot so the editor is never an empty screen.
// The seed is the CURRENT homepage, expressed as blocks — which is the point
// worth demonstrating: the hand-written page and the CMS page are the same
// components with the same content, just sourced differently.
//
// PoC only. The real implementation migrates existing `alokai.website.page`
// rows into blocks with a data migration script.

let id = 0
const block = (blockType: string, data: Record<string, unknown>): BlockInstance => ({
  id: `seed_${++id}`,
  blockType,
  data,
})

const homepageBlocks = (): BlockInstance[] => [
  block('hero', {
    eyebrow: `New Collection — ${new Date().getFullYear()}`,
    title: 'Timeless Style, Everyday Ease',
    body: 'Considered essentials in natural fabrics — cotton, linen and leather — designed to move with you and last beyond the season.',
    image: '/img/home/hero.webp',
    ctas: [
      { label: 'Shop Top Sellers', url: '/products', style: 'primary' },
      { label: 'View All Products', url: '/products', style: 'secondary' },
    ],
  }),
  block('categories', {
    eyebrow: 'Browse',
    title: 'Shop by Category',
    linkLabel: 'All categories',
    linkUrl: '/products',
    items: [
      { name: 'Women', image: '/img/home/cat_women_sand.webp', link: '/women' },
      { name: 'Men', image: '/img/home/cat_men_sand.webp', link: '/men' },
      { name: 'Accessories', image: '/img/home/cat_accessories_sand.webp', link: '/women/accessories' },
    ],
  }),
  block('bestSellers', {
    eyebrow: 'Curated',
    title: 'Best Sellers',
    linkLabel: 'View all',
    linkUrl: '/products',
    pageSize: 4,
    sort: 'popular',
  }),
  block('editorial', {
    eyebrow: 'Our Philosophy',
    title: 'Made from honest materials',
    body: 'Every piece is cut from natural fabrics — organic cotton, pure linen, full-grain leather — chosen to wear in beautifully and feel better with every year.',
    image: '/img/home/editorial.webp',
    imageAlt: 'Made from honest materials',
    imagePosition: 'left',
    ctaLabel: 'Discover the Story',
    ctaUrl: '/products',
  }),
  block('valueProps', {
    items: [
      { title: 'Free Shipping', text: 'On all orders over $150', icon: 'truck' },
      { title: '30-Day Returns', text: 'Shop with confidence', icon: 'return' },
      { title: '2-Year Warranty', text: 'Crafted to last', icon: 'shield' },
      { title: 'Expert Support', text: 'Here to help, always', icon: 'support' },
    ],
  }),
]

export default defineNitroPlugin(async () => {
  // Only seeds the file store. With Odoo behind the CMS the content is real
  // and seeding it would be vandalism.
  if (process.env.NUXT_CMS_BACKEND !== 'file') return

  const existing = await cmsStore.list()
  if (existing.length) return

  const home = await cmsStore.create(
    {
      title: 'Homepage (CMS copy)',
      slug: '/cms-home',
      metaTitle: 'Timeless Style, Everyday Ease',
      metaDescription: 'Considered essentials in natural fabrics, designed to last beyond the season.',
    },
    homepageBlocks(),
  )
  await cmsStore.publish(home.id)

  console.log('[cms] seeded demo page at /cms-home')
})
