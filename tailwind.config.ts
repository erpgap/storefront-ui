import type { Config } from 'tailwindcss'
import { tailwindConfig } from '@storefront-ui/vue/tailwind-config'
import sfTypography from '@storefront-ui/typography'

export default <Config>{
  presets: [tailwindConfig],
  content: ['./app/**/*.{vue,js,ts}', './layers/**/*.vue', './server/**/*.{ts,js}', 'node_modules/@storefront-ui/vue/**/*.{js,mjs}'],
  plugins: [sfTypography],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // Sharp 2px corners app-wide (matches the redesign's buttons). `rounded-md`
      // is the default radius used across buttons, inputs, and cards.
      borderRadius: {
        md: '2px',
        lg: '2px',
      },
      screens: {
        xxl: '1440px',
        xs: '376px',
      },
      zIndex: {
        60: '60',
        80: '60',
        100: '100',
      },
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          DEFAULT: '#000000',
        }
      }
    },
  },
}
