import fs from "fs";
import path from "path";
import productFragment from "../fragments/productFragment";

const odooBaseUrl = `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`;

const headers = {
  "Content-Type": "application/json",
  "resquest-host": "localhost:3000",
  "X-Frame-Options": "*",
};

const filePath = path.join(process.cwd(), "public/products.json");

export default defineCachedEventHandler(
  async (event) => {
    try {
      const results = await $fetch(odooBaseUrl, {
        method: "POST",
        headers: {
          ...headers,
        },
        body: JSON.stringify({
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
        }),
      });

      const products = results?.data?.products?.products || [];
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error("fetch products error-", error);
    }
  },
  { maxAge: 60 * 60 * 24 * 7 }
);
