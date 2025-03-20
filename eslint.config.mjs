// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
)
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-html': 'off',
      'vue/no-unused-vars': 'off',
    },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  })