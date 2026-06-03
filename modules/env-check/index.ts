import { defineNuxtModule } from '@nuxt/kit'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ENV_EXAMPLE_FILE = '.env.example'

export default defineNuxtModule({
  meta: {
    name: 'env-check',
  },
  setup(_options, nuxt) {
    nuxt.hook('build:before', () => {
      const envExamplePath = resolve(nuxt.options.rootDir, ENV_EXAMPLE_FILE)
      const requiredKeys = parseEnvKeys(envExamplePath)
      const missing = requiredKeys.filter((key) => !(key in process.env))

      if (missing.length > 0) {
        throw new Error(
          [
            'Missing required environment variables:',
            ...missing.map((key) => `  - ${key}`),
            '',
            'Add them to your .env file (see .env.example).',
          ].join('\n'),
        )
      }
    })
  },
})

export function parseEnvKeys(filePath: string): string[] {
  if (!existsSync(filePath)) {
    throw new Error(`Environment example file not found: ${filePath}`)
  }

  const keys: string[] = []

  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) {
      continue
    }

    let key = trimmed.slice(0, equalsIndex).trim()
    if (key.startsWith('export ')) {
      key = key.slice('export '.length).trim()
    }

    if (key) {
      keys.push(key)
    }
  }

  return keys
}
