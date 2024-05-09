# Odoo template vsf

Template base to start new odoo vsf projects using vsf SDK

## Tech stack

1. Nuxt 3
2. VSF 2
3. SFUI-2

## How to start ?

```sh
2. yarn install
3. cp -f .env.example apps/web/.env
4. export $(cat apps/web/.env | grep -v \#)
5. yarn dev
6. You can access with http://localhost:3000
```

## Search products

Find products with our search options. Choose Algolia or stick to database search.

### How to configure algolia

1. Set environment variables NUXT_ALGOLIA_API_KEY and NUXT_ALGOLIA_APPLICATION_ID
2. set NUXT_ALGOLIA_ENABLED to 1 or 0 to enable or disabled algolia search.
