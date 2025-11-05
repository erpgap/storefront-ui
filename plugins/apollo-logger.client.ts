// plugins/apollo-logger.client.ts
import { ApolloLink, Observable } from '@apollo/client/core'

export default defineNuxtPlugin((nuxtApp) => {
  // faz um cast básico só pra não ter erro de tipo
  const $apollo = (nuxtApp as any).$apollo
  if (!$apollo) return

  const logLink = new ApolloLink((operation, forward) => {
    console.info('[Apollo]', operation.operationName || 'anonymous', operation.variables)
    const t0 = Date.now()

    // força o tipo de Observable
    return new Observable((observer) => {
      const sub = forward(operation).subscribe({
        next: (result: any) => {
          console.info(
            '[Apollo done]',
            operation.operationName || 'anonymous',
            Date.now() - t0,
            'ms'
          )
          observer.next(result)
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      })
      return () => sub.unsubscribe()
    })
  })

  // encadeia o link de log antes do link atual
  $apollo.setLink(logLink.concat($apollo.link))
})
