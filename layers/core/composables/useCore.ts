import type {
  ContactUsResponse,
  MutationContactUsArgs,
  MutationNewsletterSubscribeArgs,
  NewsletterSubscribeResponse,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

export const useCore = () => {
  const { $sdk, $i18n } = useNuxtApp()
  const { t } = $i18n
  const loading = ref(false)
  const apiError = ref('')

  const newsletterSubscribe = async (
    params: MutationNewsletterSubscribeArgs,
  ): Promise<boolean> => {
    try {
      loading.value = true
      apiError.value = ''

      await $sdk().odoo.mutation<
        MutationNewsletterSubscribeArgs,
        NewsletterSubscribeResponse
      >({ mutationName: MutationName.NewsletterSubscribeMutation }, params)

      return true
    }
    catch (error: any) {
      apiError.value = errorMessage(error, t('core.genericError'))
      return false
    }
    finally {
      loading.value = false
    }
  }

  const contactUs = async (
    params: MutationContactUsArgs,
  ): Promise<boolean> => {
    try {
      loading.value = true
      apiError.value = ''

      await $sdk().odoo.mutation<
        MutationContactUsArgs,
        ContactUsResponse
      >({ mutationName: MutationName.ContactUsMutation }, params)

      return true
    }
    catch (error: any) {
      apiError.value = error?.message || t('core.genericError')
      return false
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    newsletterSubscribe,
    contactUs,
    apiError,
  }
}
