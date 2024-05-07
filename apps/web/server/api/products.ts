import productFragment from "../fragments/productFragment";
import axios from "axios";

const odooBaseUrl = `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`;

const headers = {
  "Content-Type": "application/json",
  "resquest-host": "localhost:3000",
  "X-Frame-Options": "*",
};

<<<<<<< HEAD
export default defineCachedEventHandler(
  async (event) => {
    const results = await axios({
      url: odooBaseUrl,
      method: "post",
      data: {
        query: `
=======
export default defineEventHandler(async () => {
  // Send the products as JSON
  const results = await axios({
    url: odooBaseUrl,
    method: "post",
    data: {
      query: `
>>>>>>> fd0c3df ([IMP] use nuxt server api to fetch all products and return product json for algolia)
      query products {
        products {
          totalCount
          products {
            ${productFragment}
            }
          }
        }
    `,
<<<<<<< HEAD
      },
      headers,
    });

    const products = results.data.data.products.products;
    return products;
  },
  { maxAge: 60 * 60 * 24 * 7 }
);
=======
    },
    headers,
  });

  const products = results.data.data.products.products;
  return products;
});
>>>>>>> fd0c3df ([IMP] use nuxt server api to fetch all products and return product json for algolia)
