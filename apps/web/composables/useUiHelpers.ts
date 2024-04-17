import { ProductFilterInput, QueryProductsArgs } from "~/graphql";

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

  const getFacetsFromURL = (query: any): QueryProductsArgs => {
    const filters: string[] = [];
    const newQuery = { ...query };
    delete newQuery.search;

    if (newQuery) {
      Object.keys(newQuery).forEach((filterKey) => {
        if (![...queryParamsNotFilters, "price"].includes(filterKey)) {
          if (query[filterKey].includes(",")) {
            query[filterKey]?.split(",").forEach(() => {
              filters.push(filterKey);
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
    };

    return {
      pageSize,
      currentPage: parseInt(page),
      // cacheKey: `API-P${hash(filtersForHash, { algorithm: 'md5' })}`,
      search: query.search || "",
      sort: { [sort[0]]: sort[1] },
      filter: productFilters as ProductFilterInput,
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
          const newVal = value?.split("-");
          const item = {
            filterName: label,
            label: `${newVal[1] ?? newVal[0]}`,
            id: `${newVal[0]}`,
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
      if (element.filterName === "Size") {
        if (formattedFilters[element.filterName]) {
          formattedFilters[element.filterName] +=
            `,${element.id}-${element.label}`;
          return;
        }
        formattedFilters[element.filterName] = `${element.id}-${element.label}`;
      } else {
        if (formattedFilters[element.filterName]) {
          formattedFilters[element.filterName] += `,${element.id}`;
          return;
        }
        formattedFilters[element.filterName] = `${element.id}`;
      }
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

  const getComponentProviderByName = (provider: string): string => {
    if (!provider) throw new Error("Provider without provider");

    const upperName = provider.toLocaleUpperCase();

    if (upperName === "ADYEN_OG") {
      return "AdyenExternalPaymentProvider";
    }

    if (upperName === "ADYEN") {
      return "AdyenDirectPaymentProvider";
    }

    if (upperName.includes("WIRE")) {
      return "WireTransferPaymentProvider";
    }

    throw new Error(`Provider ${name} not implemented!`);
  };
  return {
    getFacetsFromURL,
    changeFilters,
    facetsFromUrlToFilter,
    getComponentProviderByName,
  };
};
