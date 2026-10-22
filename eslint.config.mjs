// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
)
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-html': 'off',
      'vue/no-unused-vars': 'off',
      // Established single-word component names that cannot clash with an
      // HTML element; renaming them would ripple through the CMS block
      // registry and every page that uses them.
      'vue/multi-word-component-names': ['error', { ignores: ['Categories', 'Newsletter'] }],
    },
  })
  // Pages and layouts are named by their route, as Nuxt does for layers/.
  .append({
    files: ['optional-layers/*/pages/**/*.vue', 'optional-layers/*/layouts/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  })
