import productFragment from "../fragments/productFragment";
import axios from "axios";

const odooBaseUrl = `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`;

const headers = {
  "Content-Type": "application/json",
  "resquest-host": "localhost:3000",
  "X-Frame-Options": "*",
};

export default defineEventHandler(async () => {
  // Send the products as JSON
  const results = await axios({
    url: odooBaseUrl,
    method: "post",
    data: {
      query: `
      query products {
        products {
          totalCount
          products {
            ${productFragment}
            }
          }
        }
    `,
    },
    headers,
  });

  const products = results.data.data.products.products;
  return products;
});
