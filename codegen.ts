import type { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'
import { withoutTrailingSlash } from './shared/url.mjs'

const baseUrl = process.env.NUXT_PUBLIC_ODOO_BASE_URL

if (!baseUrl) {
  throw new Error('NUXT_PUBLIC_ODOO_BASE_URL is not defined. Set it in your .env file.')
}

const schemaUrl = `${withoutTrailingSlash(baseUrl)}/graphql/vsf`

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [schemaUrl]: {},
    },
  ],
  config: {
    preResolveTypes: true,
    avoidOptionals: true,
  },
  // Only the schema's types: queries here are plain strings (server/queries),
  // so the client preset's typed-document helpers were never used, and from
  // v6 it only emits types for documents it finds - none.
  generates: {
    './graphql/gql/graphql.ts': {
      plugins: [{ add: { content: '/* eslint-disable */' } }, 'typescript'],
      config: {
        // Odoo's free-form JSON fields. Typed `any`, as before codegen 7
        // changed its default for custom scalars to `unknown`.
        scalars: { GenericScalar: 'any' },
        preResolveTypes: true,
        avoidOptionals: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
