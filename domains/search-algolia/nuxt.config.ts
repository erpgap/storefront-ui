// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/algolia"],
  runtimeConfig: {}
  algolia: {
    apiKey: process.env.NUXT_ALGOLIA_API_KEY,
    applicationId: process.env.NUXT_ALGOLIA_APPLICATION_ID,
    instantSearch: {
      theme: "algolia",
    },
  },
});
