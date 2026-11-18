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
 * entries of its submenu, as the merchant made them in Odoo (an empty column
 * too: what is in Odoo shows).
 */
export function websiteFooterColumns(roots: WebsiteMenu[] | null | undefined): MenuItem[] {
  return (roots ?? [])
    .map(toItem)
    .filter((item): item is MenuItem => item !== null)
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

// The header row's width, guessed before the browser can measure it. Widths
// of the desktop header's entries (13px uppercase Inter, 0.08em tracking),
// in px per character as measured: wide letters, narrow ones, the rest; an
// entry with a submenu adds its chevron.
const WIDE = /[MW]/
const NARROW = /[\s.,:;'!|IJ1]/
const CHEVRON = 16

export function estimateEntryWidth(item: Pick<MenuItem, 'label' | 'children'>): number {
  let width = 0
  for (const char of item.label.toUpperCase()) {
    width += WIDE.test(char) ? 14 : NARROW.test(char) ? 5.5 : 9.3
  }
  return width + (item.children.length ? CHEVRON : 0)
}

/**
 * How many entries fit in `room` px, side by side `gap` px apart, leaving
 * space for More (`moreWidth`) when not all of them do. Takes the widths
 * measured in the browser, or estimated ones before it can measure.
 */
export function fitEntries(widths: number[], room: number, moreWidth: number, gap: number): number {
  const all = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(widths.length - 1, 0)
  if (all <= room) return widths.length
  let used = moreWidth
  let count = 0
  for (const width of widths) {
    if (used + gap + width > room) break
    used += gap + width
    count++
  }
  return count
}
