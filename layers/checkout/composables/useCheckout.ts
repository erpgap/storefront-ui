import { readonly, ref } from 'vue';

const loading = ref(false);

export const useCheckout = () => {
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  return {
    loading: readonly(loading),
    setLoading,
  };
};
