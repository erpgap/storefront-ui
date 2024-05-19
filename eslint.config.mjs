// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    '**/node_modules/**/*',
    '**/lib/*',
    'packages/theme/_theme',
    'packages/theme/.nuxt',
    '**/tests/*',
  ]
})
