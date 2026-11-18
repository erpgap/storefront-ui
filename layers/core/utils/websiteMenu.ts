import type { Company, WebsiteMenu } from '~~/graphql'

/** A header menu entry, from the website menu edited in Odoo (Website > Menus). */
export interface MenuItem {
  id: number
  label: string
  // '' for an entry that only groups its submenu (Odoo's '#' or no URL).
  to: string
  external: boolean
  children: MenuItem[]
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

function toItem(menu: WebsiteMenu): MenuItem | null {
  const label = (menu.name ?? '').trim()
  if (!label) return null
  const url = (menu.url ?? '').trim()
  const to = url === '#' ? '' : url
  return {
    id: menu.id,
    label,
    to,
    external: EXTERNAL.test(to),
    children: (menu.childs ?? []).map(toItem).filter((item): item is MenuItem => item !== null),
  }
}

/**
 * The header's entries: the website's top entries (no parent in Odoo), in
 * Odoo's order, each with its submenu.
 */
export function websiteMenuItems(entries: WebsiteMenu[] | null | undefined): MenuItem[] {
  return (entries ?? [])
    .map(toItem)
    .filter((item): item is MenuItem => item !== null)
}

/**
 * The footer's columns: the website's footer entries, each a heading over the
 * links of its submenu. A column without links is left out.
 */
export function websiteFooterColumns(roots: WebsiteMenu[] | null | undefined): MenuItem[] {
  return (roots ?? [])
    .map(toItem)
    .filter((item): item is MenuItem => item !== null && item.children.some(child => child.to))
}

/** A social media account of the company, for the footer's icons. */
export interface SocialLink {
  label: string
  url: string
  icon: string
}

type Socials = Pick<Company, 'socialTwitter' | 'socialLinkedin' | 'socialGithub' | 'socialFacebook' | 'socialInstagram' | 'socialYoutube'>

const SOCIALS: { field: keyof Socials, label: string, icon: string }[] = [
  { field: 'socialTwitter', label: 'X', icon: '/img/x.svg' },
  { field: 'socialLinkedin', label: 'LinkedIn', icon: '/img/linkedin.svg' },
  { field: 'socialGithub', label: 'GitHub', icon: '/img/github.svg' },
  { field: 'socialFacebook', label: 'Facebook', icon: '/img/facebook.svg' },
  { field: 'socialInstagram', label: 'Instagram', icon: '/img/instagram.svg' },
  { field: 'socialYoutube', label: 'YouTube', icon: '/img/youtube.svg' },
]

/** The accounts filled in for the company in Odoo, in a fixed order. */
export function socialLinks(company: Partial<Socials> | null | undefined): SocialLink[] {
  return SOCIALS
    .map(({ field, label, icon }) => ({ label, icon, url: (company?.[field] ?? '').trim() }))
    .filter(social => /^https?:\/\//i.test(social.url))
}
