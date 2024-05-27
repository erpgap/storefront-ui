import type { Endpoints } from "@erpgap/odoo-sdk-api-client";

export default defineEventHandler(async (event: any) => {
  const session = await useSession(event, {
    password: "80d42cfb-1cd2-462c-8f17-e3237d9027e9",
  });
  const keyName = `cache:cart:${session?.id}`;
  const data = await useStorage().getItem(keyName);

  return data;
});
