// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/device',
    '@nuxtjs/google-fonts',
    'nuxt-lodash',
    'nuxt-icon',
    'nuxt-delay-hydration',
    'nuxt-typed-router',
    '@nuxtjs/robots',
    '@nuxt/eslint',
    'nuxt-viewport',
    '@nuxtjs/sitemap',
    '@nuxtjs/critters',
    ...(process.env.NODE_ENV === 'development' ? ['@nuxt/test-utils/module'] : []),
  ],

vite: {
    optimizeDeps: {
      include: ['lodash-es'],
    },
  },


  tailwindcss: { 
    viewer: false,
    cssPath: '~/assets/css/tailwind.css',
    exposeConfig: false,
   },


  devtools: { enabled: process.env.NODE_ENV === 'development' },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=no',
      title: 'Alokai - Demo',
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'robots', content: 'index, follow' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      ],
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_MIDDLEWARE_URL,
    name: 'ERPGAP VSF',
    description: 'Welcome to an awesome ecommerce site!',
    defaultLocale: 'en',
  },

  runtimeConfig: {
    shouldByPassCacheQueryNames: [
      'LoadCartQuery',
      'WishlistLoadQuery',
      'GetAddressesQuery',
      'GetOrdersQuery',
      'LoadUserQuery',
    ],
    public: {
      odooBaseImageUrl: '',
      odooBaseUrl: '',
      middlewareUrl: '',
      currencySymbol: '',
      currencySeparator: '',
      currencyDecimal: '',
      currencyPrecision: '',
    },
  },

  build: {
    transpile: ['vue-toastification'],
  },

  experimental: {
    asyncContext: true,
    payloadExtraction: true,
  },

  compatibilityDate: '2024-11-06',

  nitro: {
    compressPublicAssets: true,
    prerender: {
      routes: ['/'], 
    },
    routeRules: {
      //'/': { swr: Number(process.env?.NUXT_SWR_CACHE_TIME) || 60 },
      '/': { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400' } },
      '/**': { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400' } },
      'assets/**': {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
        },
      },
      'public/**': {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
        },
      },
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
      },
      '/_ipx/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
      },
    },
  },


  delayHydration: {
    mode: 'init', 
  },

  device: { refreshOnResize: true, 
    defaultUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36' },

  eslint: {
    config: { stylistic: true },
  },


  googleFonts: {
    families: { 'Red Hat Display': [400, 500, 700] },
    display: 'swap',
    preconnect: true,
    preload: true,          
    download: true,        
    inject: true,
    useStylesheet: true, 
  },


  i18n: {
    locales: [{ code: 'en', file: 'en.json' }],
    strategy: 'no_prefix',
    lazy: true,
    defaultLocale: 'en',
    langDir: 'locales',
  },

  image: {
    providers: {
      odooProvider: {
        name: 'odooProvider',
        provider: '~/providers/odoo-provider.ts',
      },
    },
    screens: {
      '2xl': 1536, xxl: 1440, xl: 1280, lg: 1024, md: 768, sm: 640, xs: 376,
    },
  },

  robots: {
    allow: ['/category/*', '/product/*'],
    disallow: ['/cart', '/checkout/*', '/my-account/*', '/forgot-password', '/search?'],
  },

  sitemap: {
    sources: ['/api/sitemap/urls/products', '/api/sitemap/urls/categories'],
    runtimeCacheStorage: { driver: process.env.NUXT_STORAGE_DRIVER || 'redis' },
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
