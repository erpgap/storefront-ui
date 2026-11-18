import type { Company, WebsiteMenu } from '~~/graphql'
import { QueryName } from '~~/server/queries'
import { type MenuItem, type SocialLink, socialLinks, websiteFooterColumns } from '../utils/websiteMenu'

interface WebsiteFooter {
  columns: MenuItem[]
  socials: SocialLink[]
  company: string
}

/**
 * The footer as the merchant edits it in Odoo: its link columns (Website >
 * Configuration > Website Footer), the company's social media accounts and
 * its name. The footer shows it, and the mobile menu lists the same links.
 * Cached like the header's menu, so an edit shows once that cache renews.
 */
export const useWebsiteFooter = () => {
  const { $sdk } = useNuxtApp()
  const footer = useState<WebsiteFooter>('website-footer', () => ({ columns: [], socials: [], company: '' }))

  const loadWebsiteFooter = async () => {
    const { data } = await useAsyncData('website-footer', () =>
      $sdk().odoo.query<null, { websiteFooter: WebsiteMenu[], website: { company: Company | null } | null }>({
        queryName: QueryName.GetWebsiteFooterQuery,
      }),
    )
    const company = data.value?.website?.company
    footer.value = {
      columns: websiteFooterColumns(data.value?.websiteFooter),
      socials: socialLinks(company),
      company: (company?.name ?? '').trim(),
    }
  }

  return { footer, loadWebsiteFooter }
}
