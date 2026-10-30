// The site's secondary links, listed in the footer and in the mobile menu.
// The mobile menu lists the product categories itself, so its Shop group has
// only the first two. `labelKey` is an i18n key: translate it where rendered.

type SiteLink = { labelKey: string, link: string }

export const shopLinks: SiteLink[] = [
  { labelKey: 'core.siteLinks.topSellers', link: '/products' },
  { labelKey: 'core.siteLinks.newArrivals', link: '/products?sort=newest,DESC' },
]

export const companyLinks: SiteLink[] = [
  { labelKey: 'core.siteLinks.about', link: '/about' },
  { labelKey: 'core.siteLinks.sustainability', link: '/sustainability' },
  { labelKey: 'core.siteLinks.stores', link: '/stores' },
  { labelKey: 'core.siteLinks.journal', link: '/journal' },
]

export const supportLinks: SiteLink[] = [
  { labelKey: 'core.siteLinks.shipping', link: '/shipping' },
  { labelKey: 'core.siteLinks.returns', link: '/returns' },
  { labelKey: 'core.siteLinks.contact', link: '/contact' },
  { labelKey: 'core.siteLinks.faq', link: '/faq' },
]
