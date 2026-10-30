import { createCmsText } from '../utils/cmsText'

/** The block catalogue's text and the CMS API's errors in the editor's language. See utils/cmsText.ts. */
export function useCmsText() {
  const { t, te } = useI18n()
  return createCmsText({
    t: (key, params) => t(key, params ?? {}),
    te: key => te(key),
  })
}
