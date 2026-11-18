import type { WebsiteMenu } from '~~/graphql'
import { QueryName } from '~~/server/queries'
import { type MenuItem, websiteMenuItems } from '../utils/websiteMenu'

/**
 * The header menu, as the merchant edits it in Odoo (Website > Menus).
 * Loaded once, in the header's server render; the query is cached like the
 * catalogue's, so an edit shows once that cache and the page cache renew.
 */
export const useWebsiteMenu = () => {
  const { $sdk } = useNuxtApp()
  const items = useState<MenuItem[]>('website-menu', () => [])

  const loadWebsiteMenu = async () => {
    const { data } = await useAsyncData('website-menu', () =>
      $sdk().odoo.query<null, { websiteMenu: WebsiteMenu[] }>({ queryName: QueryName.GetWebsiteMenuQuery }),
    )
    items.value = websiteMenuItems(data.value?.websiteMenu)
  }

  return { items, loadWebsiteMenu }
}
