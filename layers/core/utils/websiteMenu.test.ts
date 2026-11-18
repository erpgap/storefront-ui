import { describe, expect, it } from 'vitest'
import type { MenuItem } from './websiteMenu'
import type { WebsiteMenu } from '~~/graphql'
import { estimateEntryWidth, fitEntries, socialLinks, websiteFooterColumns, websiteMenuItems } from './websiteMenu'

const menu = (id: number, name: string | null, url: string | null, childs: WebsiteMenu[] = []) =>
  ({ id, name, url, childs }) as WebsiteMenu

describe('websiteMenuItems', () => {
  it('takes the top entries, in order, with their submenus', () => {
    const items = websiteMenuItems([
      menu(2, 'Furniture', '/furniture', [menu(4, 'Chairs', '/chairs'), menu(5, 'Tables', '/tables')]),
      menu(3, 'Contact', '/contact'),
    ])
    expect(items.map(item => item.label)).toEqual(['Furniture', 'Contact'])
    expect(items[0]!.children.map(child => child.to)).toEqual(['/chairs', '/tables'])
    expect(items[1]!.children).toEqual([])
  })

  it('gives an entry that only groups its submenu no link', () => {
    const [byHash, empty] = websiteMenuItems([menu(2, 'Projects', '#'), menu(3, 'Sectors', null)])
    expect(byHash!.to).toBe('')
    expect(empty!.to).toBe('')
  })

  it('tells outside links from the storefront\'s own', () => {
    const items = websiteMenuItems([
      menu(2, 'Blog', 'https://blog.example.com'),
      menu(3, 'Mail', 'mailto:hi@example.com'),
      menu(4, 'Shop', '/products'),
    ])
    expect(items.map(item => item.external)).toEqual([true, true, false])
  })

  it('drops entries without a name, and copes with no menu at all', () => {
    expect(websiteMenuItems([menu(2, '  ', '/x'), menu(3, null, '/y')])).toEqual([])
    expect(websiteMenuItems(null)).toEqual([])
    expect(websiteMenuItems([])).toEqual([])
  })
})

describe('websiteFooterColumns', () => {
  it('makes each footer entry a column over its links, in order', () => {
    const columns = websiteFooterColumns([
      menu(1, 'Shop', '#', [menu(3, 'Women', '/women'), menu(4, 'Men', '/men')]),
      menu(2, 'Help', '#', [menu(5, 'Contact', '/contact')]),
    ])
    expect(columns.map(column => column.label)).toEqual(['Shop', 'Help'])
    expect(columns[0]!.children.map(link => link.to)).toEqual(['/women', '/men'])
  })

  it('keeps every column made in Odoo, an empty one and links without a page too', () => {
    const columns = websiteFooterColumns([
      menu(1, 'Empty', '#'),
      menu(2, 'Text only', '#', [menu(3, 'Open 9 to 5', '#')]),
    ])
    expect(columns.map(column => column.label)).toEqual(['Empty', 'Text only'])
    expect(columns[1]!.children[0]!.to).toBe('')
    expect(websiteFooterColumns(null)).toEqual([])
  })
})

describe('socialLinks', () => {
  it('lists the accounts that are filled in, in a fixed order', () => {
    const links = socialLinks({
      socialYoutube: 'https://youtube.com/@shop',
      socialTwitter: 'https://x.com/shop',
      socialFacebook: null,
      socialInstagram: '   ',
    })
    expect(links.map(link => link.label)).toEqual(['X', 'YouTube'])
    expect(links[1]).toEqual({ label: 'YouTube', url: 'https://youtube.com/@shop', icon: '/img/youtube.svg' })
  })

  it('ignores anything that is not a web address', () => {
    expect(socialLinks({ socialTwitter: 'javascript:alert(1)', socialGithub: '@shop' })).toEqual([])
    expect(socialLinks(null)).toEqual([])
  })
})

describe('fitting the header in one row', () => {
  it('estimates widths close to the measured ones', () => {
    // Measured in Chromium: SHOP ALL 71.9, BLOG 39.3, WOMEN (submenu) 73.3, MEN (submenu) 48.5.
    const entry = (label: string, submenu = false) => ({ label, children: submenu ? [{} as MenuItem] : [] })
    for (const [label, submenu, measured] of [['Shop all', false, 71.9], ['Blog', false, 39.3], ['Women', true, 73.3], ['Men', true, 48.5]] as const) {
      expect(Math.abs(estimateEntryWidth(entry(label, submenu)) - measured)).toBeLessThan(measured * 0.1)
    }
  })

  it('keeps all entries when they fit, and room for More when not', () => {
    expect(fitEntries([100, 100, 100], 400, 60, 20)).toBe(3)
    // 100 + 20 + 100 = 220 fits; adding More (60 + 20) to it needs 300 > 250.
    expect(fitEntries([100, 100, 100], 250, 60, 20)).toBe(1)
    expect(fitEntries([], 400, 60, 20)).toBe(0)
  })
})
