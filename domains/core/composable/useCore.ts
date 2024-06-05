import type {
  MutationNewsletterSubscribeArgs,
  NewsletterSubscribeResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";

export const useCore = () => {
  const { $sdk } = useNuxtApp();
  const loading = ref(false);
  const apiError = ref("");

  const newsletterSubscribe = async (
    params: MutationNewsletterSubscribeArgs
  ) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationNewsletterSubscribeArgs,
      NewsletterSubscribeResponse
    >({ mutationName: MutationName.NewsletterSubscribeMutation }, params);

    loading.value = false;
  };

  return {
    loading,
    newsletterSubscribe,
    apiError,
  };
};
