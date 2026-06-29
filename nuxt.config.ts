// https://nuxt.com/docs/api/configuration/nuxt-config

// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import path from 'path'

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
    './modules/env-check',
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
        'width=device-width, initial-scale=1',
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
    // Per-user / order-specific data must never be served from the shared SWR
    // cache — on /checkout and /my-account that would show a stale snapshot
    // (orders, payment state, cart, addresses, delivery methods). Static
    // reference data (countries/states) is intentionally left cacheable.
    shouldByPassCacheQueryNames: [
      'LoadCartQuery',
      'WishlistLoadQuery',
      'GetAddressesQuery',
      'GetOrdersQuery',
      'GetOrderQuery',
      'GetPaymentMethodsQuery',
      'GetPaymentConfirmation',
      'GetDeliveryMethodsQuery',
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
      routes: [],
    },
    storage: {
      cache: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
      slug: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
      cart: {
        ...storageConfig,
      },
      stock: {
        ...storageConfig,
      },
    },
    devStorage: {
      cache: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
      slug: {
        ...storageConfig,
        ttl: swrCacheTime,
      },
      cart: {
        ...storageConfig,
      },
      stock: {
        ...storageConfig,
      },
    },
  },

  routeRules: {
    '/sitemap_index.xml': { swr: swrCacheTime },
    '/__sitemap__/**': { swr: swrCacheTime },
  },

  vite: {
    optimizeDeps: {
      include: ['lodash-es'],
    },
    resolve: {
      alias: {
        '/node_modules': path.resolve(__dirname, './node_modules'),
        '/layers': path.resolve(__dirname, './layers'),
        // The Odoo SDK pulls in axios (~35 KB) but only ever uses the ofetch
        // transport we give it, so stub axios out of the client bundle.
        axios: path.resolve(__dirname, './stubs/axios.mjs'),
      },
    },
  },

  css: ['~/assets/css/tailwind.css'],

  delayHydration: {
    mode: 'init',
  },

  // The app only uses a handful of `ion:` icons (the rest are inline SVG /
  // UiLineIcon). Scan templates and bundle just those into the client so the
  // Icon component doesn't fetch icon data from the Iconify API at runtime.
  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
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
    cacheMaxAgeSeconds: swrCacheTime,
    runtimeCacheStorage: {
      driver: storageDriver,
      ...(storageUrl ? { url: storageUrl } : {}),
    },
    sitemaps: {
    products: {
      sources: ['/api/sitemap/urls/products'],
      defaults: { changefreq: 'daily', priority: 0.8 },
    },
    categories: {
      sources: ['/api/sitemap/urls/categories'],
      defaults: { changefreq: 'weekly', priority: 1.0 },
    },
    blogs: {
      sources: ['/api/sitemap/urls/blogs'],
      defaults: { changefreq: 'weekly', priority: 0.6 },
    },
    pages: {
      sources: ['/api/sitemap/urls/pages'],
      defaults: { changefreq: 'weekly', priority: 0.9 },
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
