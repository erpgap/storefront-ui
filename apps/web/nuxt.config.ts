// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
      title: 'Vue Storefront'
    },
  },
  delayHydration: {
    mode: 'init'
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    'nuxt-delay-hydration',
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          'Red Hat Display': [400, 500, 700],
          'Red Hat Text': [300, 400, 500, 700],
        },
      },
    ],
    '@nuxtjs/fontaine',
    [
      '@nuxtjs/i18n',
      {
        locales: [
          {
            code: 'en',
            file: 'en.json',
          },
        ],
        lazy: true,
        langDir: 'lang',
        defaultLocale: 'en',
      },
    ],
    '@storyblok/nuxt',
    // 'nuxt-lodash'
  ],
  storyblok: {
    accessToken: process.env.NUXT_STORYBLOK_TOKEN,
    bridge: true,
    devtools: true,
    apiOptions: {},
  },
  image: {
    screens: {
      '2xl': 1536,
      xxl: 1440,
      xl: 1280,
      lg: 1024,
      md: 768,
      sm: 640,
      xs: 376,
    },
  },
  build: {
    transpile: [
      'tslib',
      '@apollo/client',
      '@apollo/client/core',
      '@vue/apollo-composable',
      '@vue/apollo-option',
      'ts-invariant',
      'vue-toastification',
      '@erpgap/odoo-sdk-api-client'
    ]
  },
  devtools: {
    enabled: true,
  },
  runtimeConfig: {
    public: {
      odooBaseUrl: ''
    }
  },
  routeRules: {
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/icons/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  nitro: {
    compressPublicAssets: true,
  }
});
