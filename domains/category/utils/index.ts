import hash from "object-hash";

export const sortOptions = [
  {
    id: 'list_price desc',
    value: 'price,DESC',
    attrName: 'Price: High to Low',
    type: '',
  },
  {
    id: 'list_price asc',
    value: 'price,ASC',
    attrName: 'Price: Low to High',
    type: '',
  },
  { id: 'name asc', value: 'name,ASC', attrName: 'Name: A to Z', type: '' },
  {
    id: 'name desc',
    value: 'name,DESC',
    attrName: 'Name: Z to A',
    type: '',
  },
  {
    id: 'popular desc',
    value: 'popular,DESC',
    attrName: 'Most Popular',
    type: '',
  },
  {
    id: 'newest desc',
    value: 'newest,DESC',
    attrName: 'Newest',
    type: '',
  },
];

export const getUniqueUrlFromRouteFilteringByAttributes = (
  cleanPath: string,
  route: any
): string => {
  cleanPath = cleanPath?.endsWith("/") ? cleanPath?.slice(0, -1) : cleanPath;

  const newQuery = { ...route?.query };
  const attributesToExclude = ["list-view"];

  Object.keys(newQuery).forEach((key) => {
    if (attributesToExclude.includes(key)) {
      delete newQuery[key];
    }
  });

  const hashQueryParams = hash(newQuery, { algorithm: "md5" });

  return `${cleanPath}-${
    Object.keys(newQuery).length > 0 ? hashQueryParams : ""
  }`;
};
