import type { EventHandler, EventHandlerRequest } from 'h3'
import type { MiddlewareConfig } from '@erpgap/odoo-sdk-api-client/server'
import { createApiClient } from '@erpgap/odoo-sdk-api-client/server'
import { Mutations } from '~/server/mutations'
import { Queries } from '~/server/queries'

export const bootstrapApolloClient = (event: any) => {
    const config: MiddlewareConfig = {
        odooGraphqlUrl: `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`,
        queries: { ...Queries, ...Mutations },
        headers: {
            'REAL-IP': getRequestIP(event) || '',
            'resquest-host': getRequestHost(event),
        },
    }

    delete event.node.req.headers['recent-view-products']

    if (parseCookies(event).session_id) {
        (config.headers as Record<string, string>).Cookie = `session_id=${parseCookies(event).session_id
            }`
    }

    event.context.apolloClient = createApiClient(config)
}
