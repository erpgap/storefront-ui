import { defineProvider } from '@nuxt/image/runtime'
import objectHash from 'object-hash'
import { resolveOdooImageUrl } from '../app/utils/odooImage'

const hasPlaceholders = (src: string) =>
  src.includes('{width}') || src.includes('{height}')

// @nuxt/image 2 loads a provider's default export, built with defineProvider,
// and runs it on the server as well as in the browser. The runtime config
// comes from the image context it passes on both sides: importing it (from
// nuxt/app or #imports) pulls the Vue app into the server bundle or every
// auto-import into the shared type context.
export default defineProvider({
  getImage: (src, { modifiers }, ctx) => {
    const baseURL = ctx.options.runtimeConfig.public.odooBaseImageUrl
    const width = modifiers?.width ?? 0
    const height = modifiers?.height ?? 0

    if (hasPlaceholders(src)) {
      const resolvedPath = resolveOdooImageUrl(src, width, height)
      const normalizedPath = resolvedPath.startsWith('/')
        ? resolvedPath.slice(1)
        : resolvedPath

      return { url: `${baseURL}/${normalizedPath}` }
    }

    const resolution = `${width}x${height}`
    const hash = objectHash({ text: src + resolution })

    return { url: `${baseURL}/${src?.replace('/', '')}/${resolution}/${hash}` }
  },
})
