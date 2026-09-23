import { CMS_LOCALES, DEFAULT_LOCALE } from '#shared/cms/i18n'
import { GetCmsLocalesQuery } from '~~/server/queries/CmsQueries'

/**
 * The languages a merchant can write content in.
 *
 * These come from the website's active languages in Odoo, not from the Nuxt
 * i18n config. A merchant may sell in five languages while the storefront
 * ships UI translations for three - content languages and interface languages
 * are different lists, and conflating them means either offering languages the
 * merchant does not sell in or hiding ones they do.
 */
export default defineEventHandler(async (event) => {
  const fallback = {
    locales: CMS_LOCALES,
    defaultLocale: DEFAULT_LOCALE,
  }

  if (process.env.NUXT_CMS_BACKEND === 'file') return fallback

  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  try {
    const response = await $fetch<{
      data?: { cmsLocales?: { code: string, label: string, isDefault: boolean }[] }
    }>(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { query: GetCmsLocalesQuery },
    })

    const locales = response?.data?.cmsLocales ?? []
    if (!locales.length) return fallback

    return {
      locales: locales.map(l => ({ code: l.code, label: l.label })),
      defaultLocale: locales.find(l => l.isDefault)?.code ?? locales[0]!.code,
    }
  }
  catch {
    // A language list that fails to load must not take the studio down with
    // it - the merchant can still edit the default language.
    return fallback
  }
})
