import { defineNuxtPlugin } from '#app';
import { initSDK, buildModule } from '@vue-storefront/sdk';
import { OdooModule, OdooModuleType } from '@erpgap/odoo-sdk';

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();

  const sdkConfig = {
    odoo: buildModule<OdooModuleType>(OdooModule, {
      apiUrl: `${config.public.middlewareUrl}api/odoo/`,
      ofetch: useFetch
    })
  };

  return {
    provide: {
      sdk: () => initSDK<typeof sdkConfig>(sdkConfig)
    }
  };
});
