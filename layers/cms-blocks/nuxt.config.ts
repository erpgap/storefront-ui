import { fileURLToPath } from 'node:url'

// This storefront's CMS block catalogue: which blocks a merchant can place
// (`schemas.ts`), how old content upgrades (also `schemas.ts`), and which
// component renders each one (`registry.ts`). The engine in layers/cms reads
// both through the alias below and knows no block by name.
//
// Blocks that are CMS-only live in `components/`; the rest render through the
// storefront components they were built around, in layers/core.
export default defineNuxtConfig({
  alias: {
    '#cms-blocks': fileURLToPath(new URL('./', import.meta.url)),
  },
})
