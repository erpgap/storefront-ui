export async function registerDependency(tag: string, pageKey: string) {
  const storage = useStorage('cache')

  const key = `tags:${tag}`
  const existing = (await storage.getItem<string[]>(key)) || []

  if (!existing.includes(pageKey)) {
    existing.push(pageKey)
    await storage.setItem(key, existing)
  }
}

export async function getKeysByTag(tag: string): Promise<string[]> {
  const storage = useStorage('cache')
  return (await storage.getItem<string[]>(`tags:${tag}`)) || []
}

export async function removeTagRegistry(tag: string) {
  const storage = useStorage('cache')
  await storage.removeItem(`tags:${tag}`)
}
