import { getResponseHeader, setResponseHeader } from 'h3'

export const useCache = () => {
  const addTags = (tags: string[]) => {
    if (import.meta.server) {
      const event = useRequestEvent()
      if (event) {
        const headerName = 'x-cache-tags'
        let currentHeaderValue = getResponseHeader(event, headerName)

        if (Array.isArray(currentHeaderValue)) {
          currentHeaderValue = currentHeaderValue.join(',')
        }

        const existingTags = (currentHeaderValue as string || '').split(',').filter(Boolean)
        const finalTags = [...new Set([...existingTags, ...tags])]

        setResponseHeader(event, headerName, finalTags.join(','))
      }
    }
  }

  return { addTags }
}
