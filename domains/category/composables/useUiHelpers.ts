import type { ProductFilterInput, QueryProductsArgs } from "~/graphql";

export const useUiHelpers = () => {
  const route: any = useRoute();
  const router = useRouter();

  const { query, path } = route;

  const queryParamsNotFilters = ["page", "sort", "itemsPerPage"];
  const localePrefixes = ["/en", "/de", "/ru"];
  const pathToSlug = (): string => {
    for (const localePrefix of localePrefixes) {
      if (path.startsWith(localePrefix)) {
        return path.replace(localePrefix, "");
      }
    }
    return path;
  };

  const getFacetsFromURL = (
    query: any,
    ids: number[] = []
  ): QueryProductsArgs => {
    const filters: string[] = [];
    const newQuery = { ...query };

    if (newQuery) {
      Object.keys(newQuery).forEach((filterKey) => {
        if (![...queryParamsNotFilters, "price"].includes(filterKey)) {
          if (query[filterKey].includes(",")) {
            query[filterKey]?.split(",").forEach((item) => {
              filters.push(item);
            });
          } else {
            const label = query[filterKey]?.split(",")[0];
            filters.push(label);
          }
        }
      });
    }

    const price = query?.price?.split("-");

    const pageSize = query.itemsPerPage ? parseInt(query.itemsPerPage) : 12;
    const sort = query?.sort?.split(",") || [];
    const page = query?.page || 1;

    const productFilters = {
      minPrice: Number(price?.[0]) || null,
      maxPrice: Number(price?.[1]) || null,
      attribValues: filters,
      categorySlug: path === "/" || path === "/search" ? null : pathToSlug(),
      ids: ids,
    } as ProductFilterInput;

    return {
      pageSize,
      currentPage: parseInt(page),
      sort: { [sort[0]]: sort[1] },
      filter: productFilters,
      search: query?.search,
    };
  };
  const facetsFromUrlToFilter = () => {
    const formattedFilters: any = [];
    Object.keys(query).forEach((label) => {
      if (queryParamsNotFilters.includes(label)) return;

      const valueList = query[label].split(",");
      valueList.forEach((value: string) => {
        if (label === "price") {
          const item = {
            filterName: label,
            label: `${value.slice(0, 2)}`,
            id: value,
          };
          formattedFilters.push(item);
        } else {
          const item = {
            filterName: label,
            label: value,
            id: value,
          };
          formattedFilters.push(item);
        }
      });
    });
    return formattedFilters;
  };

  const changeFilters = (filters: any[], sort: string) => {
    const formattedFilters: any = {};
    filters.forEach((element) => {
      if (element.filterName === "price") {
        element.label = element.id;
      }

      if (formattedFilters[element.filterName]) {
        formattedFilters[element.filterName] += `,${element.label}`;
        return;
      }
      formattedFilters[element.filterName] = `${element.label}`;
    });

    let allQuery: any = {};
    if (filters.length > 0) {
      allQuery = { ...formattedFilters };
    } else {
      allQuery = { ...formattedFilters };
      if (query.itemsPerPage) {
        allQuery = { itemsPerPage: query.itemsPerPage };
      }
    }

    if (sort) {
      allQuery.sort = sort;
    }

    delete allQuery.page;
    router.push({ query: allQuery });
  };

  return {
    getFacetsFromURL,
    changeFilters,
    facetsFromUrlToFilter,
  };
};
