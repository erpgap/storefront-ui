const PLACEHOLDER_WIDTH = '{width}'
const PLACEHOLDER_HEIGHT = '{height}'

export function resolveOdooImageUrl(
  imageUrl: string,
  width: number,
  height: number,
): string {
  return imageUrl
    .replace(PLACEHOLDER_WIDTH, String(width))
    .replace(PLACEHOLDER_HEIGHT, String(height))
}

export function buildOdooImageUrl(
  imageUrl: string | null | undefined,
  width: number,
  height: number,
  baseUrl = '',
): string {
  if (!imageUrl) return ''

  const resolvedPath = resolveOdooImageUrl(imageUrl, width, height)
  const normalizedPath = resolvedPath.startsWith('/')
    ? resolvedPath.slice(1)
    : resolvedPath

  return `${baseUrl}${normalizedPath}`
}
