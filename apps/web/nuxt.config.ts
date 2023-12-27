// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Vue Storefront',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@300;400;500;700&display=swap',
        },
      ],
    },
  },
  delayHydration: {
    mode: 'init'
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    'nuxt-delay-hydration',
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
  $production: {
    nitro: {
      compressPublicAssets: true
    }
  }
});
