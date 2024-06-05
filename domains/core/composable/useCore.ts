import type {
  MutationNewsletterSubscribeArgs,
  NewsletterSubscribeResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { useToast } from "vue-toastification";

export const useCore = () => {
  const { $sdk } = useNuxtApp();
  const loading = ref(false);
  const apiError = ref("");

  const newsletterSubscribe = async (
    params: MutationNewsletterSubscribeArgs
  ) => {
    loading.value = true;

    const { error } = await $sdk().odoo.mutation<
      MutationNewsletterSubscribeArgs,
      NewsletterSubscribeResponse
    >({ mutationName: MutationName.CreateUpdatePartner }, params);

    if (error.value) {
      apiError.value = error.value.message;
      loading.value = false;
      showError({
        ...error.value,
        status: 404,
        message: error.value.message,
      });
      return;
    }
    loading.value = false;
  };

  return {
    loading,
    newsletterSubscribe,
    apiError,
  };
};
