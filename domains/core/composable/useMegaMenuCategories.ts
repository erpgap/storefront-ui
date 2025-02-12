import type {
    QueryCategoriesArgs,
    CategoryListResponse,
    Category,
  } from "~/graphql";
  import { QueryName } from "~/server/queries";
  
  export const useMegaMenuCategories = () => {
    const { $sdk } = useNuxtApp();
  
    const loading = ref(false);
    const categoriesForMegaMenu = useState<Category[]>("mega-menu-categories", () => []);


    const loadCategoriesForMegaMenu = async (params: QueryCategoriesArgs) => {
      loading.value = true;
      try {
        const { data } = await useAsyncData(
          'categories-megamenu',
          async () => {
            const { data, error } = await $sdk().odoo.query<
              QueryCategoriesArgs,
              CategoryListResponse
            >({ queryName: QueryName.GetCategoriesQuery }, params);
  
            return data.value;
          }
        );
  
        if (data?.value?.categories) {
            categoriesForMegaMenu.value = data.value.categories?.categories;
        }
      } finally {
        loading.value = false;
      }
    };

  
  
    return {
      loading,
      categoriesForMegaMenu,

      loadCategoriesForMegaMenu
    };
  };
  