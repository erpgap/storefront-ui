import type {
  MutationNewsletterSubscribeArgs,
  NewsletterSubscribeResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { useToast } from "vue-toastification";

const toast = useToast();

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

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    loading.value = false;
    toast.success("Your email has been added to the newsletter subscription");
  };

  return {
    loading,
    newsletterSubscribe,
    apiError,
  };
};
