// The site's secondary links, listed in the footer and in the mobile menu.
// The mobile menu lists the product categories itself, so its Shop group has
// only the first two.

type SiteLink = { label: string, link: string }

export const shopLinks: SiteLink[] = [
  { label: 'Top Sellers', link: '/products' },
  { label: 'New Arrivals', link: '/products?sort=newest,DESC' },
]

export const companyLinks: SiteLink[] = [
  { label: 'About', link: '/about' },
  { label: 'Sustainability', link: '/sustainability' },
  { label: 'Stores', link: '/stores' },
  { label: 'Journal', link: '/journal' },
]

export const supportLinks: SiteLink[] = [
  { label: 'Shipping', link: '/shipping' },
  { label: 'Returns', link: '/returns' },
  { label: 'Contact', link: '/contact' },
  { label: 'FAQ', link: '/faq' },
]
