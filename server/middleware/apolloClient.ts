//import { createApiClient } from "../../../../../odoo/packages/sdk-api-client/src/index.server";
//import { MiddlewareConfig } from "@erpgap/odoo-sdk-api-client/server";
import type {
  MiddlewareConfig} from "@erpgap/odoo-sdk-api-client/server";
import {
  createApiClient
} from "@erpgap/odoo-sdk-api-client/server";
import { Mutations } from "~/server/mutations";
import { Queries } from "~/server/queries";

export default defineEventHandler((event) => {
  const config: MiddlewareConfig = {
    odooGraphqlUrl: `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`,
    queries: { ...Queries, ...Mutations },
    headers: {
      "REAL-IP": getRequestIP(event) || "",
      Cookie: `session_id=${parseCookies(event).session_id}`,
      "resquest-host": getRequestHost(event),
    },
  };

  event.context.apolloClient = createApiClient(config);
});
