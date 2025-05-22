import { useToast } from 'vue-toastification'
import type {
  MutationNewsletterSubscribeArgs,
  NewsletterSubscribeResponse,
} from '~/graphql'
import { MutationName } from '~/server/mutations'

const toast = useToast()

export const useCore = () => {
  const { $sdk } = useNuxtApp()
  const loading = ref(false)
  const apiError = ref('')

  const newsletterSubscribe = async (
    params: MutationNewsletterSubscribeArgs,
  ) => {
    try {
      loading.value = true

      await $sdk().odoo.mutation<
        MutationNewsletterSubscribeArgs,
        NewsletterSubscribeResponse
      >({ mutationName: MutationName.NewsletterSubscribeMutation }, params)

      toast.success('Your email has been added to the newsletter subscription')
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    newsletterSubscribe,
    apiError,
  }
}
