import type { ProviderGetImage } from '@nuxt/image'
import objectHash from 'object-hash'
import { resolveOdooImageUrl } from '../app/utils/odooImage'

const hasPlaceholders = (src: string) =>
  src.includes('{width}') || src.includes('{height}')

export const getImage: ProviderGetImage = (src, { modifiers }) => {
  const baseURL = useRuntimeConfig().public.odooBaseImageUrl
  const width = modifiers?.width ?? 0
  const height = modifiers?.height ?? 0

  if (hasPlaceholders(src)) {
    const resolvedPath = resolveOdooImageUrl(src, width, height)
    const normalizedPath = resolvedPath.startsWith('/')
      ? resolvedPath.slice(1)
      : resolvedPath

    return { url: `${baseURL}${normalizedPath}` }
  }

  const resolution = `${width}x${height}`
  const hash = objectHash({ text: src + resolution })

  return { url: `${baseURL}${src?.replace('/', '')}/${resolution}/${hash}` }
}
