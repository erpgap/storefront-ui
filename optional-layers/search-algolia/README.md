# Algolia search (optional)

Search backed by Algolia instead of Odoo. Not loaded by default: the
storefront's search is `layers/search-default`.

It lives outside `layers/` because Nuxt loads every layer there. While it
did, it registered `@nuxtjs/algolia` on every install - which warned
about missing keys at every start and, having no type declarations for
its plugin, made every `$sdk`/`$currency` untyped - for a `/search` page
that `layers/search-default` always overrode.

To use it:

1. Set `NUXT_ALGOLIA_API_KEY` and `NUXT_ALGOLIA_APPLICATION_ID`.
2. Add `'./optional-layers/search-algolia'` to `extends` in `nuxt.config.ts`.
3. Remove `layers/search-default` (both layers define `/search`, and a
   layer under `layers/` wins over one in `extends`).
