import type { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'

const baseUrl = process.env.NUXT_PUBLIC_ODOO_BASE_URL

if (!baseUrl) {
  throw new Error('NUXT_PUBLIC_ODOO_BASE_URL is not defined. Set it in your .env file.')
}

const schemaUrl = `${baseUrl.replace(/\/$/, '')}/graphql/vsf`

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
  ignoreNoDocuments: true,
  generates: {
    './graphql/gql/': {
      documents: ['graphql/**/*.tsx'],
      preset: 'client',
      config: {
        preResolveTypes: true,
        avoidOptionals: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
