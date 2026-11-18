import { describe, expect, it } from 'vitest'
import type { WebsiteMenu } from '~~/graphql'
import { websiteMenuItems } from './websiteMenu'

const menu = (id: number, name: string | null, url: string | null, childs: WebsiteMenu[] = []) =>
  ({ id, name, url, childs }) as WebsiteMenu

describe('websiteMenuItems', () => {
  it('takes the entries under the root, in order, with their submenus', () => {
    const items = websiteMenuItems([menu(1, 'Top Menu', '#', [
      menu(2, 'Furniture', '/furniture', [menu(4, 'Chairs', '/chairs'), menu(5, 'Tables', '/tables')]),
      menu(3, 'Contact', '/contact'),
    ])])
    expect(items.map(item => item.label)).toEqual(['Furniture', 'Contact'])
    expect(items[0]!.children.map(child => child.to)).toEqual(['/chairs', '/tables'])
    expect(items[1]!.children).toEqual([])
  })

  it('gives an entry that only groups its submenu no link', () => {
    const [byHash, empty] = websiteMenuItems([menu(1, 'Top', '#', [menu(2, 'Projects', '#'), menu(3, 'Sectors', null)])])
    expect(byHash!.to).toBe('')
    expect(empty!.to).toBe('')
  })

  it('tells outside links from the storefront\'s own', () => {
    const items = websiteMenuItems([menu(1, 'Top', '#', [
      menu(2, 'Blog', 'https://blog.example.com'),
      menu(3, 'Mail', 'mailto:hi@example.com'),
      menu(4, 'Shop', '/products'),
    ])])
    expect(items.map(item => item.external)).toEqual([true, true, false])
  })

  it('drops entries without a name, and copes with no menu at all', () => {
    expect(websiteMenuItems([menu(1, 'Top', '#', [menu(2, '  ', '/x'), menu(3, null, '/y')])])).toEqual([])
    expect(websiteMenuItems(null)).toEqual([])
    expect(websiteMenuItems([menu(1, 'Top', '#')])).toEqual([])
  })
})
