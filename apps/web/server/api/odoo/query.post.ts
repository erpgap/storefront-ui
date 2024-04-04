import { ApolloError } from '@apollo/client';
import { Endpoints } from '@erpgap/odoo-sdk-api-client';

export default defineCachedEventHandler(
  async (event) => {
    const body = await readBody(event);
    const api: Endpoints = event.context.apolloClient.api;

    try {
      const response = await api.query(body?.[0], body?.[1]);

      if ((response.data as any)?.cookie) {
        appendResponseHeader(event, 'Set-cookie', (response.data as any)?.cookie);
      }

      if (response.errors) {
        throw createError({ statusCode: 500, data: response.errors, message: response.errors[0].message });
      }

      delete (response.data as any).cookie;

      return response.data;
    } catch (error: any) {
      const apolloError = error as ApolloError;

      if (apolloError.graphQLErrors?.length > 0) {
        throw createError({ statusCode: 500, data: apolloError.graphQLErrors, message: apolloError.message });
      }
      if (apolloError.protocolErrors?.length > 0) {
        throw createError({ statusCode: 400, data: apolloError.protocolErrors, message: apolloError.message });
      }
      if (apolloError.clientErrors?.length > 0) {
        throw createError({ statusCode: 400, data: apolloError.clientErrors, message: apolloError.message });
      }
      if (apolloError.networkError) {
        throw createError({
          statusCode: 500,
          data: (apolloError.networkError as any)?.result?.errors,
          message: apolloError.message,
        });
      }

      throw createError({ statusCode: 500, data: error?.data, message: error.data?.[0]?.message });
    }
  },
  {
    maxAge: 60 * 60,
    getKey: async (event) => {
      const body = await readBody(event);
      return `${body?.[0].queryName}-${JSON.stringify(body?.[1] || {})}`;
    },
    shouldBypassCache: async (event) => {
      const config = useRuntimeConfig(event);
      const body = await readBody(event);

      const checkIfQueryNameIsEqual = (queryName: string) => queryName === body?.[0].queryName;

      if (config?.shouldByPassCacheQueryNames?.some(checkIfQueryNameIsEqual)) {
        return true;
      }

      return false;
    },
    // transform: async (entry, args) => {
    //   const newEntry = { ...entry };
    //   delete entry.value.headers['Set-cookie'];
    //   newEntry.value.headers.test = 123;
    //   console.log(args);

    //   return newEntry.value;
    // },
  },
);
