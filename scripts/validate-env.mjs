import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(rootDir, '.env')
const examplePath = resolve(rootDir, '.env.example')

if (!existsSync(envPath)) {
  console.error('Missing .env file. Copy .env.example to .env and configure it.')
  process.exit(1)
}

if (!existsSync(examplePath)) {
  console.error('Missing .env.example file.')
  process.exit(1)
}

config({ path: envPath })

/**
 * @param {string} content
 * @returns {string[]}
 */
function parseRequiredKeysFromExample(content) {
  const keys = []

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)
    if (match) {
      keys.push(match[1])
    }
  }

  return keys
}

const exampleContent = readFileSync(examplePath, 'utf8')
const requiredKeys = parseRequiredKeysFromExample(exampleContent)
const missingKeys = requiredKeys.filter(key => process.env[key] === undefined)

if (missingKeys.length > 0) {
  console.error(
    `Missing required env variables (from .env.example):\n${missingKeys.map(key => `  - ${key}`).join('\n')}`,
  )
  process.exit(1)
}

console.log(`Env validation passed (${requiredKeys.length} variables).`)
