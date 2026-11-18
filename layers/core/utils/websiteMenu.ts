import type { WebsiteMenu } from '~~/graphql'

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
 * The header's entries: what sits under the website's menu root, in Odoo's
 * order, each with its submenu.
 */
export function websiteMenuItems(roots: WebsiteMenu[] | null | undefined): MenuItem[] {
  return (roots ?? [])
    .flatMap(root => root.childs ?? [])
    .map(toItem)
    .filter((item): item is MenuItem => item !== null)
}
