// https://nuxt.com/docs/api/configuration/nuxt-config

// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import path from 'path'
console.log('NUXT_PUBLIC_ODOO_BASE_URL from nuxt.config.ts:', process.env.NUXT_PUBLIC_ODOO_BASE_URL);

const swrCacheTime = Number(process.env?.NUXT_SWR_CACHE_TIME || 3600)
const storageDriver = process.env.NUXT_STORAGE_DRIVER || 'memory'
const storageUrl = process.env.NUXT_STORAGE_URL
const storageConfig = {
  driver: storageDriver,
  ...(storageUrl ? { url: storageUrl } : {}),
}

export default defineNuxtConfig({
 /*  extends: [                                                          
    '@erpgap/recent-view-products',                                      
   ], */ 
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/google-fonts',
    'nuxt-delay-hydration',
    'nuxt-typed-router',
    '@nuxtjs/robots',
    '@nuxt/eslint',
    'nuxt-viewport',
    '@nuxtjs/sitemap',
    '@nuxt/icon',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      viewport:
        'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=no',
      title: 'Alokai',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [{ name: 'robots', content: 'index, follow' }],
    },
  },

   future: {
    compatibilityVersion: 4,
  },

  site: {
    url: process.env.NUXT_PUBLIC_MIDDLEWARE_URL,
    name: 'ERPGAP VSF',
    description: 'Welcome to an awesome ecommerce site!',
    defaultLocale: 'en',
  },

  runtimeConfig: {
    cacheInvalidationKey: process.env.NUXT_CACHE_INVALIDATION_KEY,
    cacheInvalidationSigningSecret: process.env.NUXT_CACHE_INVALIDATION_SIGNING_SECRET,
    cacheInvalidationStorageDriver: storageDriver,
    cacheInvalidationStorageUrl: storageUrl,
    shouldByPassCacheQueryNames: [
      'LoadCartQuery',
      'WishlistLoadQuery',
      'GetAddressesQuery',
    ],
    public: {
      odooBaseImageUrl: process.env.NUXT_PUBLIC_ODOO_BASE_IMAGE_URL,
      odooBaseUrl: process.env.NUXT_PUBLIC_ODOO_BASE_URL,
      middlewareUrl: process.env.NUXT_PUBLIC_MIDDLEWARE_URL,
      currencySymbol: process.env.NUXT_PUBLIC_CURRENCY_SYMBOL || '$',
      currencySeparator: process.env.NUXT_PUBLIC_CURRENCY_SEPARATOR,
      currencyDecimal: process.env.NUXT_PUBLIC_CURRENCY_DECIMAL,
      currencyPrecision: process.env.NUXT_PUBLIC_CURRENCY_PRECISION,
      siteURL: process.env.NUXT_PUBLIC_MIDDLEWARE_URL, 
    },
  },

  build: {
    transpile: ['vue-toastification'],
  },

 $production: {
    routeRules: {
      '/': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) },
      '/products': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) },
    },

  },

  experimental: {
    asyncContext: true,
    componentIslands: true,
  },

  compatibilityDate: '2024-11-06',

  nitro: {
    compressPublicAssets: true,
    prerender: {
      routes: ['/'], 
    },
    storage: {
      cache: {
        ...storageConfig,
      },
      slug: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
    },
    devStorage: {
      cache: {
        ...storageConfig,
      },
      slug: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['lodash-es'],
    },
    resolve: {
      alias: {
        '/node_modules': path.resolve(__dirname, './node_modules'),
        '/layers': path.resolve(__dirname, './layers'),
      },
    },
  },

  css: ['~/assets/css/tailwind.css'],

  delayHydration: {
    mode: 'init',
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
    display: 'swap',
    preload: true,
    preconnect: true,
  },

  i18n: {
    legacy: false,
    locales: [
      { code: 'en', file: 'en.json', },
    ],
    strategy: 'no_prefix',
    lazy: true,
    defaultLocale: 'en',
  },

  image: {
    providers: {
      odooProvider: {
        name: 'odooProvider',
        provider: path.resolve(__dirname, './providers/odoo-provider.ts'),
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
    allow: ['/category/*', '/product/*'],
    disallow: ['/cart', '/checkout/*', '/my-account/*', '/forgot-password', '/search?'],
  },

  sitemap: {
    cacheTtl: 1000 * 60 * 60,
    runtimeCacheStorage: true,
    sitemaps: {
    products: {
      sources: ['/api/sitemap/urls/products'],
      defaults: { changefreq: 'daily', priority: 0.8 },
    },
    categories: {
      sources: ['/api/sitemap/urls/categories'],
      defaults: { changefreq: 'weekly', priority: 1.0 },
    },
  },
  },

  tailwindcss: {
    viewer: false,
  },

  alias: {
    '#layers': path.resolve(__dirname, './layers')
  },

  viewport: {
    breakpoints: {
      desktopSmall: 1024,
      desktop: 1280,
      desktopMedium: 1440,
      desktopWide: 1600,
      mobile: 320,
      mobileMedium: 375,
      mobileWide: 425,
      tablet: 768,
    },
  },

})
