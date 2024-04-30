import { defineCronHandler } from "#nuxt/cron";
import productFragment from "../fragments/productFragment";
import axios from "axios";
import * as fs from "fs";
import path from "path";

const odooBaseUrl = `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`;

const headers = {
  headers: {
    "Content-Type": "application/json",
    "resquest-host": "localhost:3000",
    "X-Frame-Options": "*",
  },
};

export default defineCronHandler("hourly", async () => {
  const result = await axios({
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
    headers: headers.headers,
  });

  const products = result.data.data.products.products;
  const jsonProducts = JSON.stringify(products, null, 2);

  const publicFolder = path.join(process.cwd(), "public");
  const filePath = path.join(publicFolder, "products.json");

  fs.writeFile(filePath, jsonProducts, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("JSON data has been written to products.json");
    }
  });
});
