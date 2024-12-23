// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  extends: [
    './domains/auth',
    './domains/recent-view-products',
    // "./domains/cart-odoo",
    './domains/cart-redis',
    './domains/category',
    './domains/checkout',
    './domains/core',
    './domains/my-account',
    './domains/product',
    // "./domains/search-algolia",
    './domains/search-default',
    './domains/search-luigi',
    './domains/wishlist',
  ],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/device',
    '@nuxtjs/google-fonts',
    'nuxt-lazy-hydrate',
    'nuxt-lodash',
    'nuxt-icon',
    'nuxt-delay-hydration',
    'nuxt-typed-router',
    '@nuxtjs/robots',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
      title: '%s',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [{ name: 'robots', content: 'index, follow' }],
    },
  },

  site: {
    url: 'https://vsfsdk.labs.odoogap.com/',
    name: 'ERPGAP VSF',
    description: 'Welcome to an awesome ecommerce site!',
    defaultLocale: 'en',
  },

  runtimeConfig: {
    shouldByPassCacheQueryNames: [
      'LoadCartQuery',
      'WishlistLoadQuery',
      'GetAddressesQuery',
    ],
    public: {
      odooBaseImageUrl: '',
      odooBaseUrl: '',
      currencySymbol: '',
      currencySeparator: '',
      currencyDecimal: '',
      currencyPrecision: '',
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
      '@erpgap/odoo-sdk-api-client',
    ],
  },

  routeRules: {
    '/': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) },
    '/category/*': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) },
    '/product/*': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) },
  },

  experimental: {
    asyncContext: false,
  },

  compatibilityDate: '2024-11-06',

  nitro: {
    // compressPublicAssets: true,
    storage: {
      cache: {
        driver: process.env.NUXT_STORAGE_DRIVER,
        url: process.env.NUXT_STORAGE_URL,
      },
    },
    devStorage: {
      cache: {
        driver: process.env.NUXT_STORAGE_DRIVER,
        url: process.env.NUXT_STORAGE_URL,
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['lodash-es'],
    },
  },

  delayHydration: {
    mode: 'init',
  },

  device: {
    refreshOnResize: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  googleFonts: {
    families: {
      'Red Hat Display': [400, 500, 700],
    },
  },

  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.json',
      },
    ],
    strategy: 'no_prefix',
    lazy: true,
    langDir: 'lang',
    defaultLocale: 'en',
  },

  image: {
    providers: {
      odooProvider: {
        name: 'odooProvider',
        provider: '~/providers/odoo-provider.ts',
      },
    },
    screens: {
      '2xl': 1536,
      'xxl': 1440,
      'xl': 1280,
      'lg': 1024,
      'md': 768,
      'sm': 640,
      'xs': 376,
    },
  },

  robots: {
    allow: '/category/*',
  },

  tailwindcss: {
    viewer: false,
  },
})
