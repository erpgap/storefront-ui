// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://scripts.luigisbox.com/LBX-732226.js',
          async: true,
        },
      ],
    },
  },
  runtimeConfig: {},
})
